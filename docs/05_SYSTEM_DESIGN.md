# System Design Document
## Club Innogeeks — Member & Club Management Platform

**Version:** 1.0  
**Date:** June 15, 2026  

---

## 1. Architecture Overview

```
┌────────────────────────────┐     ┌────────────────────────────┐
│   ANDROID APP (primary)     │     │   QUIZ WEBSITE              │
│   Kotlin + Compose, MVVM    │     │   React + Vite + TanStack   │
│   Clean Arch, Room offline  │     │   (Round 1 test only)       │
└──────────────┬─────────────┘     └──────────────┬─────────────┘
               │   HTTPS / REST (shared OpenAPI contract, JWT)
               └───────────────┬───────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS API SERVER (stateless)         │
│  Helmet · rate-limit · CORS · Clerk JWT · RBAC               │
│  Route handlers → Zod validation → Drizzle ORM (txns)       │
└──────┬──────────────────┬──────────────────┬────────────────┘
       │                  │                  │
┌──────▼──────┐   ┌──────▼──────┐    ┌──────▼──────────┐
│  PgBouncer  │   │    Redis    │    │  File Storage    │
│  → Postgres │   │  (cache)    │    │  (Object Storage │
│  (Drizzle)  │   │             │    │   for PDFs)      │
└─────────────┘   └─────────────┘    └─────────────────┘
       │
┌──────▼──────┐   ┌─────────────┐
│    Clerk    │   │  Razorpay   │
│ (Auth+Roles)│   │  (UPI QR)   │
└─────────────┘   └─────────────┘
```

The Android app is the primary client for all roles. The quiz website is a thin client used only for the Round 1 test. Both share one stateless Express API and one PostgreSQL database — there is no Firebase/Supabase and no separate web backend.

---

## 2. Database Schema

### users
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
clerk_id      text UNIQUE NOT NULL
email         text UNIQUE NOT NULL
name          text NOT NULL
role          enum('public','member','coordinator','core_team') DEFAULT 'public'
domain        enum('android','web','ml','iot','arvr') NULLABLE
year          integer NULLABLE
created_at    timestamp DEFAULT now()
updated_at    timestamp DEFAULT now()
```

### role_change_log
```sql
id            uuid PRIMARY KEY
changed_by    uuid REFERENCES users(id)
target_user   uuid REFERENCES users(id)
old_role      text
new_role      text
old_domain    text
new_domain    text
reason        text
created_at    timestamp DEFAULT now()
```

### recruitment_windows
```sql
id            uuid PRIMARY KEY
is_open       boolean DEFAULT false
opened_by     uuid REFERENCES users(id)
opened_at     timestamp
closed_by     uuid REFERENCES users(id)
closed_at     timestamp
academic_year text (e.g., '2026-27')
```

### recruitment_applications
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users(id)
email           text NOT NULL  -- must be @kiet.edu
roll_number     text NOT NULL
name            text NOT NULL
domain          enum('android','web','ml','iot','arvr')
payment_method  enum('upi','cash')
payment_status  enum('pending','cash_pending','approved','rejected') DEFAULT 'pending'
razorpay_order_id    text NULLABLE  -- Razorpay order (UPI path)
razorpay_payment_id  text NULLABLE  -- set after verified webhook
idempotency_key      text NULLABLE  -- safe payment retries
round1_status   enum('pending','cleared','failed') DEFAULT 'pending'
round2_status   enum('pending','cleared','failed') DEFAULT 'pending'
round2_score    jsonb NULLABLE (rubric scores)
round2_notes    text NULLABLE
reviewed_by     uuid REFERENCES users(id) NULLABLE
status          enum('registered','round1_qualified','round2_qualified','selected','rejected')
created_at      timestamp DEFAULT now()
updated_at      timestamp DEFAULT now()
```

### attendance_sessions
```sql
id            uuid PRIMARY KEY
domain        enum('android','web','ml','iot','arvr')
title         text NOT NULL
session_date  date NOT NULL
created_by    uuid REFERENCES users(id)
created_at    timestamp DEFAULT now()
```

### attendance_records
```sql
id            uuid PRIMARY KEY
session_id    uuid REFERENCES attendance_sessions(id)
user_id       uuid REFERENCES users(id)
is_present    boolean DEFAULT false
marked_by     uuid REFERENCES users(id)
created_at    timestamp DEFAULT now()
UNIQUE(session_id, user_id)
```

### resource_folders
```sql
id              uuid PRIMARY KEY
domain          enum('android','web','ml','iot','arvr')
name            text NOT NULL
parent_id       uuid REFERENCES resource_folders(id) NULLABLE
order_index     integer DEFAULT 0
created_by      uuid REFERENCES users(id)
created_at      timestamp DEFAULT now()
updated_at      timestamp DEFAULT now()
```

### resources
```sql
id            uuid PRIMARY KEY
folder_id     uuid REFERENCES resource_folders(id)
domain        enum('android','web','ml','iot','arvr')
title         text NOT NULL
type          enum('pdf','link')
url           text NOT NULL (storage URL or external link)
created_by    uuid REFERENCES users(id)
created_at    timestamp DEFAULT now()
```

### events
```sql
id                  uuid PRIMARY KEY
title               text NOT NULL
description         text
event_date          timestamp NOT NULL
venue               text
banner_url          text NULLABLE
registration_scope  enum('open','members_only') DEFAULT 'open'
status              enum('draft','published','past') DEFAULT 'draft'
created_by          uuid REFERENCES users(id)
created_at          timestamp DEFAULT now()
updated_at          timestamp DEFAULT now()
```

### event_registrations
```sql
id            uuid PRIMARY KEY
event_id      uuid REFERENCES events(id)
user_id       uuid REFERENCES users(id)
attended      boolean DEFAULT false
created_at    timestamp DEFAULT now()
UNIQUE(event_id, user_id)
```

---

## 3. API Endpoint Groups

### Auth (via Clerk webhooks)
- `POST /api/auth/webhook` — Clerk webhook to sync user to DB on signup

### Users
- `GET /api/users/me` — current user profile + role
- `PATCH /api/users/:id/role` — change user role (core team only)
- `GET /api/users` — list users with filters (core team only)

### Recruitment
- `GET /api/recruitment/window` — get current window status
- `PATCH /api/recruitment/window` — open/close window (core team only)
- `POST /api/recruitment/apply` — submit application
- `POST /api/recruitment/applications/:id/approve-payment` — approve payment (coord/core)
- `POST /api/recruitment/applications/:id/round1` — mark round 1 result (coord/core)
- `POST /api/recruitment/applications/:id/round2` — mark round 2 result + score (coord/core)
- `GET /api/recruitment/applications` — list all applications (coord/core)
- `GET /api/recruitment/applications/my` — applicant's own application

### Attendance
- `POST /api/attendance/sessions` — create session (coord/core)
- `GET /api/attendance/sessions` — list sessions (filtered by domain for coord)
- `POST /api/attendance/sessions/:id/mark` — submit attendance records
- `GET /api/attendance/sessions/:id/records` — get records for a session
- `GET /api/attendance/me` — member's own attendance summary
- `GET /api/attendance/domain/:domain` — full domain grid (coord/core)

### Resources
- `GET /api/resources/domains` — all domains with folder trees
- `GET /api/resources/folders/:domain` — folder tree for a domain
- `POST /api/resources/folders` — create folder (coord/core)
- `PATCH /api/resources/folders/:id` — rename/reorder/move (coord/core)
- `DELETE /api/resources/folders/:id` — delete folder (coord/core)
- `POST /api/resources` — add resource (upload PDF or link)
- `DELETE /api/resources/:id` — remove resource (coord/core)
- `GET /api/resources/upload-url` — get presigned upload URL for PDF

### Events
- `GET /api/events` — list all events (public)
- `GET /api/events/:id` — event detail (public)
- `POST /api/events` — create event (coord/core)
- `PATCH /api/events/:id` — edit event (coord/core)
- `POST /api/events/:id/register` — register for event
- `GET /api/events/:id/registrations` — list registrations (coord/core)
- `POST /api/events/:id/attendance` — mark post-event attendance (coord/core)

---

## 4. Role-Based Access Control (RBAC)

Implemented as Express middleware:

```typescript
// Middleware chain per route:
authenticate()          // Clerk JWT → user from DB
requireRole(['coordinator', 'core_team'])  // role check
requireDomain('android') // for domain-scoped routes (coordinators only see their domain)
```

### Role Hierarchy
```
core_team > coordinator > member > public
```

Core team can do anything any lower role can do, plus core-team-exclusive actions.

---

## 5. Payment Flow

### UPI Path (Razorpay)
```
Applicant submits form
  → status: 'registered'
  → Backend creates a Razorpay order (with an idempotency key)
  → Razorpay UPI QR shown in the Android app
  → Applicant pays via any UPI app
  → Razorpay webhook hits the backend → signature verified
  → status: 'round1_qualified' (atomic, idempotent)
  → On failure/expiry → status stays 'registered' (applicant can retry)
```

### Cash Path
```
Applicant selects "Cash" on form
  → status: 'cash_pending'
  → Coordinator/core team sees in "Pending Approvals" queue
  → Manual approval → status: 'round1_qualified'
```

### Round 1 Quiz (after payment)
```
round1_qualified applicant opens the quiz website
  → authenticates (same Clerk JWT)
  → takes the quiz → submits
  → backend auto-scores → updates round1_status ('cleared'/'failed')
  → no manual entry; result visible in the Android app
```

---

## 6. File Storage Strategy

- PDFs uploaded to Object Storage (Replit App Storage)
- Storage path convention: `resources/{domain}/{folder_id}/{filename}`
- Event banners: `events/{event_id}/banner.{ext}`
- Presigned URLs used for direct client uploads (reduces server load)
- Max sizes enforced both client-side (UX) and server-side (validation)
- Randomized storage keys to prevent path guessing

---

## 7. API Security Layer

Applied as ordered Express middleware on every request:

```
helmet()              → secure HTTP headers (CSP, HSTS, no X-Powered-By)
cors(allowlist)       → only the Android app + quiz site origins
express.json({limit}) → 1MB JSON body cap (10MB multipart for PDFs)
rateLimit(global)     → coarse per-IP limit
rateLimit(perRoute)   → stricter limits on /auth, /apply, /payment
authenticate()        → verify Clerk JWT; load user+role+domain from DB
requireRole([...])    → RBAC check
requireDomain(...)    → domain scoping for coordinators
zodValidate(schema)   → validate body/query/params, reject on failure
```

- **Auth:** Clerk JWT verified server-side on every protected route; role and domain are read from the DB, never trusted from the client.
- **Input validation:** Zod schemas on all inputs; SQL injection prevented by Drizzle parameterised queries.
- **File uploads:** server-side MIME sniffing + size cap + randomized keys.
- **KIET email:** `@kiet.edu` enforced server-side (regex + domain check).
- **Recruitment window:** state checked server-side on every application submission.
- **Razorpay webhooks:** signature-verified before any status change.
- **Secrets:** all keys in environment variables, never returned to clients.
- **Destructive actions:** delete/reject require confirmation client-side and authorization server-side.

---

## 8. Scalability (5,000+ users)

- **Stateless API** — JWT auth, no server session state → horizontal scaling behind a load balancer.
- **PgBouncer** connection pooling in front of Postgres to bound connections under load.
- **Redis cache** for hot reads: recruitment window status, attendance summaries, public events, auth lookups; invalidated on writes.
- **Pagination** on every list endpoint — no unbounded queries.
- **WebSocket-ready** — stateless + JWT means Socket.io (with a Redis adapter) can be added for future in-app chat **without redesign**.

---

## 9. Race Condition Prevention

| Scenario | Mechanism |
|---|---|
| Two coordinators mark the same student in one session | `SELECT ... FOR UPDATE` row lock + `UNIQUE(session_id, user_id)` constraint |
| Duplicate payment submit / webhook retry | Idempotency key on payment + signature-verified webhook; status change is idempotent |
| Round 2 clear → status update → role assign | Single DB **transaction** (all-or-nothing) |
| Double event registration | `UNIQUE(event_id, user_id)` constraint |
| Duplicate application per cycle | `UNIQUE(user_id, academic_year)` constraint |
| Concurrent recruitment-window toggle | Optimistic concurrency via `updated_at` check |

---

## 10. Database Indexes

| Table | Index | Why |
|---|---|---|
| `users` | `email` (unique) | login + KIET email lookups |
| `users` | `domain` | filter members/coordinators by domain |
| `users` | `role` | admin role listings |
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

---

## 11. Security Considerations (summary)

- All API routes authenticated (except public events + club info endpoints)
- Domain scoping: coordinators can only write to their own domain
- Role elevation: only core_team can promote users
- File type validation server-side (MIME type check, not just extension)
- KIET email validation: regex + domain check on server
- Recruitment window state checked server-side on every application submission
- All destructive actions (delete folder, reject application) require confirmation
- The Android client enforces certificate pinning and stores its token in encrypted storage (see `08_ANDROID_ARCHITECTURE.md`)
