# System Design Document
## Club Innogeeks — Member & Club Management Platform

**Version:** 2.0 (Supabase-native)
**Date:** June 15, 2026

---

## 1. Architecture Overview

```
┌────────────────────────────┐     ┌────────────────────────────┐
│   ANDROID APP (primary)     │     │   QUIZ WEBSITE              │
│   Kotlin + Compose, MVVM    │     │   React + Vite + TanStack   │
│   Clean Arch, Room offline  │     │   (Round 1 test only)       │
└──────┬──────────────┬───────┘     └──────┬──────────────┬──────┘
       │ Supabase SDK │  trusted REST      │ supabase-js  │ trusted REST
       │ (RLS-guarded)│  (JWT)             │ (RLS-guarded)│  (JWT)
       ▼              ▼                    ▼              ▼
┌──────────────────────────┐     ┌──────────────────────────────┐
│        SUPABASE          │     │   TRUSTED EXPRESS SERVER      │
│  Postgres + Auth + RLS   │◄────│  (stateless, service-role)    │
│  Auto REST/Realtime API  │     │  Helmet · rate-limit · CORS   │
│  Storage policies        │     │  Verifies Supabase JWT        │
└──────────────────────────┘     └──────┬───────────────┬───────┘
                                         │               │
                                  ┌──────▼─────┐  ┌──────▼──────┐
                                  │  Razorpay  │  │ Cloudinary  │
                                  │  (UPI QR)  │  │ (PDF/banner)│
                                  └────────────┘  └─────────────┘
```

**Supabase is the single source of truth** — managed PostgreSQL, Auth, Row-Level Security (RLS), and an auto-generated REST/Realtime API. The Android app and the quiz website talk **directly to Supabase** via the official SDKs (Supabase Kotlin SDK; `supabase-js`); **RLS enforces all role/domain access at the database layer**, so a malicious client cannot read or write outside its permissions.

A **thin, stateless trusted Express server** handles only operations that require secrets or server-side trust and that RLS alone cannot safely express:

1. **Razorpay** order creation (idempotent) and webhook signature verification → payment status update.
2. **Quiz auto-scoring** on submit — correct answers never leave the server — plus the atomic `round1_status` update.
3. **Round 2 clear → role assignment** — application status update + `member` role/domain assignment, in a single atomic transaction.
4. **Cloudinary signed-upload** signature generation for PDFs and event banners.

The trusted server uses the Supabase **service-role key** (bypasses RLS) and **verifies the caller's Supabase JWT** on every protected route. There is no Firebase and no self-managed Postgres.

---

## 2. Database Schema

All application tables live in the `public` schema. Identity lives in Supabase's `auth.users`; each user has one `public.profiles` row whose `id` equals `auth.users.id`.

### profiles
```sql
id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
email         text UNIQUE NOT NULL
name          text NOT NULL
role          enum('public','member','coordinator','core_team') NOT NULL DEFAULT 'public'
domain        enum('android','web','ml','iot','arvr') NULLABLE
year          integer NULLABLE
created_at    timestamptz NOT NULL DEFAULT now()
updated_at    timestamptz NOT NULL DEFAULT now()
```
A trigger on `auth.users` (AFTER INSERT) auto-creates the matching `profiles` row with role `public`. Role and domain are **never** set by the client — only by the trusted server or a core_team action guarded by RLS.

### role_change_log
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
changed_by    uuid REFERENCES profiles(id)
target_user   uuid REFERENCES profiles(id)
old_role      text
new_role      text
old_domain    text
new_domain    text
reason        text
created_at    timestamptz NOT NULL DEFAULT now()
```

### recruitment_windows
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
is_open       boolean NOT NULL DEFAULT false
opened_by     uuid REFERENCES profiles(id)
opened_at     timestamptz
closed_by     uuid REFERENCES profiles(id)
closed_at     timestamptz
academic_year text NOT NULL  -- e.g., '2026-27'
updated_at    timestamptz NOT NULL DEFAULT now()  -- optimistic concurrency
```

### recruitment_applications
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES profiles(id)
email           text NOT NULL  -- must be @kiet.edu
roll_number     text NOT NULL
name            text NOT NULL
domain          enum('android','web','ml','iot','arvr') NOT NULL
academic_year   text NOT NULL
payment_method  enum('upi','cash')
payment_status  enum('pending','cash_pending','approved','rejected') NOT NULL DEFAULT 'pending'
razorpay_order_id    text NULLABLE
razorpay_payment_id  text NULLABLE  -- set after verified webhook
idempotency_key      text NULLABLE  -- safe payment retries
round1_status   enum('pending','cleared','failed') NOT NULL DEFAULT 'pending'
round2_status   enum('pending','cleared','failed') NOT NULL DEFAULT 'pending'
round2_score    jsonb NULLABLE  -- rubric scores
round2_notes    text NULLABLE
reviewed_by     uuid REFERENCES profiles(id) NULLABLE
status          enum('registered','round1_qualified','round2_qualified','selected','rejected') NOT NULL DEFAULT 'registered'
created_at      timestamptz NOT NULL DEFAULT now()
updated_at      timestamptz NOT NULL DEFAULT now()
UNIQUE(user_id, academic_year)
```

### attendance_sessions
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
domain        enum('android','web','ml','iot','arvr') NOT NULL
title         text NOT NULL
session_date  date NOT NULL
created_by    uuid REFERENCES profiles(id)
created_at    timestamptz NOT NULL DEFAULT now()
```

### attendance_records
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
session_id    uuid NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE
user_id       uuid NOT NULL REFERENCES profiles(id)
is_present    boolean NOT NULL DEFAULT false
marked_by     uuid REFERENCES profiles(id)
created_at    timestamptz NOT NULL DEFAULT now()
UNIQUE(session_id, user_id)
```

### resource_folders
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
domain          enum('android','web','ml','iot','arvr') NOT NULL
name            text NOT NULL
parent_id       uuid REFERENCES resource_folders(id) ON DELETE CASCADE NULLABLE  -- max 2 levels (enforced in app/RLS)
order_index     integer NOT NULL DEFAULT 0
created_by      uuid REFERENCES profiles(id)
created_at      timestamptz NOT NULL DEFAULT now()
updated_at      timestamptz NOT NULL DEFAULT now()
```

### resources
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
folder_id     uuid REFERENCES resource_folders(id) ON DELETE CASCADE
domain        enum('android','web','ml','iot','arvr') NOT NULL
title         text NOT NULL
type          enum('pdf','link') NOT NULL
url           text NOT NULL  -- Cloudinary URL or external link
created_by    uuid REFERENCES profiles(id)
created_at    timestamptz NOT NULL DEFAULT now()
```

### events
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
title               text NOT NULL
description         text
event_date          timestamptz NOT NULL
venue               text
banner_url          text NULLABLE  -- Cloudinary URL
registration_scope  enum('open','members_only') NOT NULL DEFAULT 'open'
status              enum('draft','published','past') NOT NULL DEFAULT 'draft'
created_by          uuid REFERENCES profiles(id)
created_at          timestamptz NOT NULL DEFAULT now()
updated_at          timestamptz NOT NULL DEFAULT now()
```

### event_registrations
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
event_id      uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE
user_id       uuid NOT NULL REFERENCES profiles(id)
attended      boolean NOT NULL DEFAULT false
created_at    timestamptz NOT NULL DEFAULT now()
UNIQUE(event_id, user_id)
```

### quizzes
```sql
id                 uuid PRIMARY KEY DEFAULT gen_random_uuid()
title              text NOT NULL
description        text
domain             enum('android','web','ml','iot','arvr') NULLABLE
academic_year      text NULLABLE
time_limit_seconds integer NULLABLE
passing_score      integer NOT NULL DEFAULT 0
is_published       boolean NOT NULL DEFAULT false
created_by         uuid REFERENCES profiles(id)
created_at         timestamptz NOT NULL DEFAULT now()
updated_at         timestamptz NOT NULL DEFAULT now()
```

### quiz_questions
```sql
id                   uuid PRIMARY KEY DEFAULT gen_random_uuid()
quiz_id              uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE
question_text        text NOT NULL
options              jsonb NOT NULL  -- string[]
correct_option_index integer NOT NULL  -- never exposed to quiz-takers
marks                integer NOT NULL DEFAULT 1
order_index          integer NOT NULL DEFAULT 0
```

### quiz_submissions
```sql
id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
quiz_id        uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE
email          text NOT NULL
application_id uuid REFERENCES recruitment_applications(id) NULLABLE
answers        jsonb NOT NULL  -- { questionId: chosenIndex }
score          integer NOT NULL
total          integer NOT NULL
passed         boolean NOT NULL
created_at     timestamptz NOT NULL DEFAULT now()
UNIQUE(quiz_id, email)  -- one submission per email
```

> The Drizzle schema in `lib/db/src/schema/` is the source of truth for these tables and is applied with `pnpm --filter @workspace/db run push`. RLS policies, the `auth.users` foreign key, and the profile-creation trigger are applied as raw SQL (Drizzle does not manage RLS).

---

## 3. Access Paths

Most reads/writes go **directly from the client to Supabase** and are authorized by RLS. The trusted Express server is used only for the operations listed in §1.

### Direct-to-Supabase (RLS-enforced)
- Profiles: read own profile; core_team reads/updates roles (guarded by RLS + audited).
- Recruitment window: public read; core_team toggle.
- Applications: applicant reads own; coordinator reads own-domain; core_team reads all.
- Attendance: coordinator/core_team create sessions and mark; member reads own.
- Resources: members read all domains; coordinator writes own domain; core_team writes all.
- Events: public reads published; coordinator/core_team create/edit; eligible users register.

### Trusted Express endpoints (service-role; JWT-verified)
- `POST /api/payments/razorpay/order` — create order + UPI QR (idempotency key).
- `POST /api/payments/razorpay/webhook` — verify signature → update payment status (idempotent).
- `GET  /api/quizzes/:id/take` — return published quiz questions **without** correct answers (validates KIET email against an application).
- `POST /api/quizzes/:id/submit` — score answers, enforce one-submission-per-email, update `round1_status` atomically.
- `POST /api/recruitment/applications/:id/round2` — score Round 2; on clear, application status update + role assignment in one transaction.
- `POST /api/uploads/cloudinary/sign` — return a signed Cloudinary upload payload (PDF/banner; size + type constrained).
- `GET  /api/healthz` — liveness.

---

## 4. Role-Based Access Control (RBAC)

RBAC is enforced **primarily by Postgres RLS**, with the trusted server applying the same rules for its service-role operations.

### Role hierarchy
```
core_team > coordinator > member > public
```

### How RLS reads role/domain
Policies resolve the caller's role and domain by sub-querying `profiles` keyed by `auth.uid()`:
```sql
-- helper used inside policies
create or replace function public.current_role() returns text
language sql stable as $$ select role::text from public.profiles where id = auth.uid() $$;

create or replace function public.current_domain() returns text
language sql stable as $$ select domain::text from public.profiles where id = auth.uid() $$;
```
- **Domain scoping:** coordinator write policies check `domain = public.current_domain()`.
- **Role elevation:** only `core_team` may change `profiles.role`; enforced by an UPDATE policy and audited to `role_change_log`.
- Role and domain are read from the DB via `auth.uid()`, **never** trusted from client input.

---

## 5. Payment Flow

### UPI Path (Razorpay)
```
Applicant submits form (direct to Supabase) → status: 'registered'
  → App calls trusted server: POST /api/payments/razorpay/order (idempotency key)
  → Razorpay UPI QR shown in the Android app
  → Applicant pays via any UPI app
  → Razorpay webhook → trusted server verifies signature
  → payment_status: 'approved', status: 'round1_qualified' (atomic, idempotent)
  → On failure/expiry → status stays 'registered' (applicant can retry)
```

### Cash Path
```
Applicant selects "Cash" → payment_status: 'cash_pending'
  → Coordinator/core_team sees the "Pending Approvals" queue (RLS-scoped)
  → Manual approval → payment_status: 'approved', status: 'round1_qualified'
```

### Round 1 Quiz (after payment)
```
round1_qualified applicant opens the quiz website
  → authenticates with Supabase Auth (same identity)
  → GET /api/quizzes/:id/take returns questions without answers
  → submits → POST /api/quizzes/:id/submit auto-scores on the server
  → round1_status set to 'cleared'/'failed'; one submission per email
  → result visible in the Android app
```

---

## 6. File Storage Strategy (Cloudinary)

- PDFs and event banners are stored in **Cloudinary**.
- Clients request a **signed upload** payload from `POST /api/uploads/cloudinary/sign`; the trusted server signs with the Cloudinary API secret. The client then uploads **directly** to Cloudinary (reduces server load).
- Folder/public-id conventions: `resources/{domain}/{folder_id}/{filename}`, `events/{event_id}/banner`.
- Constraints enforced server-side in the signed params + validated on use: PDF ≤ 10MB (`resource_type=raw`, `format=pdf`), banner images ≤ 5MB.
- The resulting secure URL is stored in `resources.url` / `events.banner_url`.

---

## 7. API Security Layer

### Direct-to-Supabase
- **RLS on every table** is the authorization boundary; default-deny, explicit policies per role/domain.
- Supabase Auth issues short-lived JWTs; the anon key is public by design and safe only because RLS is enabled everywhere.
- Storage access is via signed Cloudinary uploads, not public write.

### Trusted Express server (ordered middleware)
```
helmet()              → secure HTTP headers (CSP, HSTS, no X-Powered-By)
cors(allowlist)       → only the Android app + quiz site origins
express.json({limit}) → 1MB JSON body cap
rateLimit(global)     → coarse per-IP limit
rateLimit(perRoute)   → stricter on /payments, /quizzes/submit, /uploads
verifySupabaseJwt()   → validate the caller's Supabase JWT; load profile/role/domain
zodValidate(schema)   → validate body/query/params, reject on failure
```
- **Razorpay webhooks:** `X-Razorpay-Signature` verified before any status change.
- **Quiz integrity:** correct answers never sent to clients; scoring is server-only.
- **KIET email:** `@kiet.edu` enforced server-side (regex + domain check) and mirrored in RLS/CHECK where applicable.
- **Secrets:** Supabase service-role key, Razorpay keys, Cloudinary secret live only on the trusted server; never returned to clients.

---

## 8. Scalability (5,000+ users)

- **Supabase connection pooling (Supavisor)** bounds Postgres connections; clients use the pooled endpoint (session pooler for migrations, transaction pooler for app traffic where applicable).
- **RLS pushes authorization into the database**, so clients query Supabase directly — fewer network hops and no app-tier fan-out for ordinary reads/writes.
- **Stateless trusted server** — JWT-verified, no session state → horizontal scaling behind a load balancer.
- **Pagination** on every list — PostgREST range headers / SDK `.range()`; no unbounded queries.
- **Indexes** per §10. **Realtime** (Supabase) is available for future live features without redesign.

---

## 9. Race Condition Prevention

| Scenario | Mechanism |
|---|---|
| Two coordinators mark the same student in one session | `UNIQUE(session_id, user_id)` + upsert/`ON CONFLICT`; row lock where a read-modify-write is needed |
| Duplicate payment submit / webhook retry | Idempotency key on order + signature-verified webhook; status change is idempotent |
| Round 2 clear → status update → role assign | Single DB **transaction** on the trusted server (all-or-nothing) |
| Double event registration | `UNIQUE(event_id, user_id)` constraint |
| Duplicate application per cycle | `UNIQUE(user_id, academic_year)` constraint |
| Duplicate quiz submission | `UNIQUE(quiz_id, email)` constraint |
| Concurrent recruitment-window toggle | Optimistic concurrency via `updated_at` check |

---

## 10. Database Indexes

| Table | Index | Why |
|---|---|---|
| `profiles` | `email` (unique) | login + KIET email lookups |
| `profiles` | `domain` | filter members/coordinators by domain |
| `profiles` | `role` | admin role listings |
| `recruitment_applications` | `user_id` | applicant's own application lookup |
| `recruitment_applications` | `status` | filtered application lists |
| `recruitment_applications` | `domain` | domain-filtered application lists |
| `recruitment_applications` | `(user_id, academic_year)` unique | one application per cycle |
| `attendance_sessions` | `domain` | list sessions per domain |
| `attendance_records` | `session_id` | fetch a session's records |
| `attendance_records` | `user_id` | a member's attendance summary |
| `attendance_records` | `(session_id, user_id)` unique | prevent double marking |
| `resource_folders` | `(domain, parent_id)` | render folder tree per domain |
| `resources` | `folder_id` | list resources in a folder |
| `events` | `status` | public published-event listing |
| `event_registrations` | `event_id` | list registrations per event |
| `event_registrations` | `(event_id, user_id)` unique | prevent double registration |
| `quiz_questions` | `quiz_id` | load a quiz's questions |
| `quiz_submissions` | `quiz_id` | list submissions per quiz |
| `quiz_submissions` | `(quiz_id, email)` unique | one submission per email |

---

## 11. Security Considerations (summary)

- **RLS is the primary authorization layer** — every table is default-deny with explicit per-role/domain policies.
- Direct client access is safe because the anon key only ever operates under RLS.
- Domain scoping: coordinators can only write to their own domain (RLS).
- Role elevation: only core_team can promote users; audited in `role_change_log`.
- Quiz answers and all secrets live only on the trusted server.
- File uploads: signed Cloudinary uploads with server-enforced type/size; randomized public IDs.
- KIET email validation: regex + domain check server-side.
- Recruitment window state checked server-side / via policy on every application submission.
- The Android client enforces certificate pinning and stores its token in encrypted storage (see `08_ANDROID_ARCHITECTURE.md`).
