# Known Issues & TODO

This file tracks problems flagged in code review that need to be fixed.
Items are roughly ordered by severity.

---

## 🔴 Critical / Security

### 1. `timingSafeEqual` without length check (payments webhook)
**File:** `artifacts/api-server/src/routes/payments.ts` — webhook handler

**Problem:**  
`crypto.timingSafeEqual(a, b)` throws if `a.length !== b.length`. A Razorpay
webhook request with a malformed (wrong-length) `x-razorpay-signature` header
will cause an unhandled exception → 500, making it trivial to DoS webhook
processing.

**Fix:**
```ts
const sigBuf = Buffer.from(signature, "utf8");
const expBuf = Buffer.from(expected, "utf8");
if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
  res.status(400).json({ error: "Invalid signature" });
  return;
}
```

---

## 🟠 High / Data Integrity

### 2. Non-atomic quiz submit + application status update
**File:** `artifacts/api-server/src/routes/quiz.ts` — `POST /quiz/:quizId/submit`

**Problem:**  
Currently:
1. `quiz_submissions.insert(...)` — succeeds
2. `recruitment_applications.update(round1_status)` — if this fails, it only
   logs an error but still returns `201`. The DB is now inconsistent: submission
   recorded but application still shows `round1_status: "pending"`.

**Fix options (pick one):**
- **A (recommended):** Write a Postgres RPC `submit_quiz(quiz_id, email, application_id, answers)` that does both inside a transaction. Add it to `supabase/migrations/003_quiz_rpc.sql` and call it from Express.
- **B (simpler):** If the application update fails after a successful insert, issue a compensating delete on `quiz_submissions` then return 500:
  ```ts
  if (updateErr) {
    // compensating rollback
    await supabaseAdmin.from("quiz_submissions")
      .delete().eq("quiz_id", quizId).eq("email", email);
    res.status(500).json({ error: "Failed to record quiz result — please retry" });
    return;
  }
  ```

---

## 🟡 Medium / Missing Endpoints

### 3. Missing: quiz coordinator endpoints
**Problem:**  
There is no Express route for coordinators to create/edit/publish quizzes via
the trusted server. Coordinators can't build the Round1 quiz without direct DB
access.

**Suggested endpoints to add (`artifacts/api-server/src/routes/quizzes.ts`):**
```
POST   /api/quizzes              — create quiz (coordinator/core_team)
PUT    /api/quizzes/:id          — update quiz + replace questions (coordinator/core_team)
PATCH  /api/quizzes/:id/publish  — toggle published state (coordinator/core_team)
```

**Note:** Read/list of quizzes for students goes directly via Supabase SDK (RLS
allows `is_published=true` to public). Only write operations need the trusted
server.

---

### 4. Missing: application submission endpoint
**Problem:**  
There is no `POST /api/recruitment/apply` endpoint. Applicants need a server-
side validated path to create an application (KIET email check, open-window
check, no-duplicate check).

**Suggested endpoint:**
```
POST /api/recruitment/apply
Body: { name, email (@kiet.edu only), phone, domain, academicYear }
Auth: Supabase JWT (requireAuth)
- Check recruitment_windows.is_open = true for academicYear
- Check no existing application for (user_id, academicYear)
- Insert into recruitment_applications with status = "applied"
Returns: { applicationId }
```

---

### 5. Missing: application listing endpoint
**Problem:**  
Coordinators/core_team have no server-side endpoint to list applications for
their domain. Currently they'd need to query Supabase directly — fine via SDK
with RLS, but no pagination/filtering helper exists.

**Note:** This might actually be fine via Supabase SDK + RLS (coordinators can
SELECT from `recruitment_applications` where `domain = their domain`). Decide
whether this needs an Express route or RLS is sufficient.

---

## 🟡 Medium / Configuration

### 6. Rate limit tiers (values can be tuned)
**File:** `artifacts/api-server/src/middleware/rateLimiter.ts`

**Current values:**
- General: 120 req/min
- Payment: 20 req/min
- Quiz: 5 req/min

**Suggested stricter tiers:**
- Public (unauthenticated): 100 req/15min
- Authenticated: 500 req/15min
- Payment: 10 req/hour
- Quiz submit: 5 req/15min

**Fix:**
```ts
export const generalLimiter = rateLimit({ windowMs: 15*60*1000, max: 100, ... });
export const authedLimiter  = rateLimit({ windowMs: 15*60*1000, max: 500, ... });
export const paymentLimiter = rateLimit({ windowMs: 60*60*1000, max: 10, ... });
export const quizLimiter    = rateLimit({ windowMs: 15*60*1000, max: 5, ... });
```

---

## 🟢 Low / Nice-to-have

### 7. `ALLOWED_ORIGINS` in production (CORS)
**File:** `artifacts/api-server/src/app.ts`

**Status:** Already implemented — empty `ALLOWED_ORIGINS` allows all origins in
dev, blocks non-listed origins in prod.  
**Action:** Make sure `ALLOWED_ORIGINS` is set to the quiz website domain before
going live. See `.env.example` for guidance.

---

### 8. Quiz path naming inconsistency
**Current paths:** `/api/quiz/:quizId` and `/api/quiz/:quizId/submit`  
**Possible preference:** `/api/quizzes/:quizId` (more RESTful plural noun)

**Note:** This is a breaking change if the Android app or quiz website already
consumes these URLs. Only rename if you haven't built clients yet.

---

## Out of scope for Express server (handled via Supabase SDK + RLS directly)

These were flagged but are intentionally NOT in the Express server:

- `GET /api/attendance/*` — Android app hits Supabase directly; RLS enforces coordinator-only writes
- `GET /api/resources/*` — same, Supabase direct
- `GET /api/events/*` — same, Supabase direct
- `GET /api/users/*` — same, Supabase direct

The Express server is intentionally thin. Adding these routes would duplicate
what Supabase's auto REST API + RLS already provides securely.

---

## Applied migrations

Apply these in order via **Supabase SQL Editor** or MCP:

1. `supabase/migrations/001_schema.sql` — all tables + indexes
2. `supabase/migrations/002_rls.sql` — RLS policies + trigger + `assign_member_role` RPC

If you implement fix #2 option A, also apply:
3. `supabase/migrations/003_quiz_rpc.sql` *(to be written)*
