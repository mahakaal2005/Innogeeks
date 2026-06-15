# Technical Requirements Plan (TRP)
## Club Innogeeks — Member & Club Management Platform

**Version:** 2.0 (Supabase-native)

---

## 1. System Overview

A platform for Club Innogeeks at KIET Group of Institutions, made up of three deployables on a **Supabase-native** backbone:

1. **Supabase backend** (managed PostgreSQL + Auth + Row-Level Security + auto-generated REST/Realtime API) — the single source of truth for all data and the primary authorization boundary.
2. **Trusted Express server** (Node.js 24 + TypeScript) — a thin, stateless service for operations that need secrets or server-side trust: Razorpay payments, quiz auto-scoring, Round 2 → role assignment, and Cloudinary upload signing.
3. **Android app** (Kotlin + Jetpack Compose) — the **primary client** for all four roles (public, member, coordinator, core team). Talks directly to Supabase (RLS-guarded) and to the trusted server for the few protected operations.
4. **Quiz website** (React + Vite) — a lightweight site students open on college computers to take the Round 1 recruitment test; auto-scored by the trusted server.

There is **no separate web frontend** for the main app — everything members and organizers do happens on the Android app. The platform handles recruitment (with payment), attendance tracking, resource sharing, event management, and the recruitment quiz.

---

## 2. User Roles & Permissions Matrix

| Feature | Public (non-member) | 1st Year Member | Coordinator (2nd year) | Core Team (3rd/4th year) |
|---|---|---|---|---|
| View club info & events | ✅ | ✅ | ✅ | ✅ |
| Register for open events | ✅ | ✅ | ✅ | ✅ |
| Register for club recruitment | ✅ (KIET email only) | — | — | — |
| Pay ₹50 recruitment fee (UPI/Cash) | ✅ | — | — | — |
| View own attendance | — | ✅ | ✅ | ✅ |
| View domain student attendance | — | — | ✅ (own domain) | ✅ (all) |
| Create attendance session | — | — | ✅ | ✅ |
| Mark attendance | — | — | ✅ | ✅ |
| Upload resources (PDF/links) | — | — | ✅ (own domain) | ✅ |
| Create/manage resource folders | — | — | ✅ (own domain) | ✅ |
| View resources | — | ✅ (all domains) | ✅ | ✅ |
| Create/manage events | — | — | ✅ | ✅ |
| Shortlist interview candidates | — | — | ✅ | ✅ |
| Approve cash payments (pending) | — | — | ✅ | ✅ |
| Manage user roles | — | — | — | ✅ |
| View all recruitment applications | — | — | — | ✅ |

All of the above is enforced by **Postgres RLS policies** (and mirrored by the trusted server for its service-role operations), not just by the client UI.

---

## 3. Authentication & Identity

- **Auth provider:** **Supabase Auth** (email + password; email confirmation). JWTs are issued by Supabase and verified by RLS (for direct access) and by the trusted server (for protected routes).
- **Login method:** Email + Password. A KIET email (`@kiet.edu`) is required to submit a recruitment application (enforced server-side).
- **Public users:** Can register with any email to view club info and events.
- **Profiles:** Each `auth.users` row has a matching `public.profiles` row (`id = auth.users.id`) holding `role`, `domain`, and `year`. A Postgres trigger auto-creates the profile with role `public` on signup.
- **Role assignment:**
  - Public: default on signup.
  - 1st Year Member: auto-assigned after clearing Round 2 (atomic transaction on the trusted server).
  - Coordinator / Core Team: assigned by core team via admin tools (RLS-guarded UPDATE on `profiles`, audited to `role_change_log`).
- Role and domain are read from the database via `auth.uid()` and are **never** trusted from the client.

---

## 4. Domains

The five club domains, each treated as a distinct unit for attendance and resources:
1. Android
2. Web Development
3. Machine Learning (ML)
4. IoT (Internet of Things)
5. AR/VR

---

## 5. Core Modules

### 5.1 Recruitment Module
- Registration form (name, roll no., KIET email, domain preference).
- Payment:
  - UPI QR via **Razorpay** (order created by the trusted server) → webhook-verified → `round1_qualified`.
  - Cash → `cash_pending` → manual approval by coordinator/core team → `round1_qualified`.
- Round 1: online quiz on the **quiz website**; the trusted server auto-scores on submission and updates `round1_status` (`cleared`/`failed`) — no manual entry.
- Round 2: interview — coordinators + core team score on rubrics; on clear, the system assigns `member` role + domain (atomic).
- Recruitment window: opened/closed by core team (off by default).

### 5.2 Attendance Module
- Sessions created on-demand by coordinators (domain, date, title).
- Coordinator marks attendance for domain students + self; members see their own percentage and history.
- Coordinators see the full domain grid; core team sees all domains.

### 5.3 Resource Module
- Organized by domain at the top level; sub-folders within each domain (max 2 levels).
- Resource types: PDF (uploaded to **Cloudinary**) and Link (URL).
- All members can view all domains; upload restricted to the domain's coordinator and core team.

### 5.4 Events Module
- Created by coordinators/core team (title, description, date/time, venue, banner, registration scope).
- Scope: open to all / members only.
- Public event listing (no login). Post-event attendance marking by coordinator/core team.

### 5.5 Public Club Page
- Club description, domains, achievements; upcoming events; recruitment open/closed banner. No login required.

---

## 6. Technology Stack

### 6.1 Backend (Supabase-native)

| Layer | Technology |
|---|---|
| Data + Auth + API | **Supabase** — managed PostgreSQL, Supabase Auth, RLS, auto REST/Realtime |
| Trusted server | Node.js 24 + TypeScript 5.9, Express 5 (stateless) |
| ORM / migrations | Drizzle ORM + drizzle-kit (`push`); RLS & triggers applied as raw SQL |
| Validation | Zod (`zod/v4`) + `drizzle-zod` |
| File Storage | **Cloudinary** (signed direct uploads for PDFs/banners) |
| Payments | **Razorpay** (UPI QR) + manual cash flow |
| Security | RLS (primary); Helmet v8, express-rate-limit v7, CORS, body limits (trusted server) |
| API Contract | OpenAPI spec → Orval codegen (trusted endpoints) |
| Hosting | Replit (dev) → Replit Deployments (prod); Supabase managed |

### 6.2 Android App (primary client)

| Layer | Technology |
|---|---|
| Language | Kotlin 2.4.0 |
| UI | Jetpack Compose (BOM 2026.05.00), Material 3, glassmorphism theme |
| Architecture | MVVM + Clean Architecture, multi-module |
| DI | Hilt 2.57.1 (via KSP) |
| Local DB | Room 2.8.4 (via KSP), offline-first single source of truth |
| Backend access | **Supabase Kotlin SDK** (Auth + Postgrest, RLS-guarded) + Retrofit 3.0.0/OkHttp 5.4.0 for trusted endpoints (cert pinning, auth interceptor) |
| Serialization | kotlinx.serialization 1.10.0 |
| Async | Coroutines 1.11.0 + Flow |
| Navigation | Navigation 3 (1.0.0), type-safe routes |
| Prefs | Encrypted DataStore 1.2.1 |
| Images | Coil 3.5.0 |
| Annotation processing | KSP 2.4.0-2.3.9 (no KAPT) |

See `08_ANDROID_ARCHITECTURE.md` for the full Android architecture.

### 6.3 Quiz Website

| Layer | Technology |
|---|---|
| Frontend | React + Vite (TypeScript) |
| Styling | Tailwind CSS + Glassmorphism theme (matches Android) |
| State / Data | TanStack Query (React Query) |
| Backend | **Supabase** (`supabase-js`, Auth) + trusted Express server for take/submit/scoring |
| API Contract | Shared OpenAPI spec → Orval codegen (trusted endpoints) |

---

## 7. Data Models (High Level)

- **Profile:** id (= auth.users.id), name, email, role (public/member/coordinator/core_team), domain, year, created_at
- **RecruitmentApplication:** id, user_id, domain, payment_status, round1_status, round2_status, score, created_at
- **AttendanceSession:** id, domain, title, date, created_by, created_at
- **AttendanceRecord:** id, session_id, user_id, is_present, marked_by, created_at
- **ResourceFolder:** id, domain, name, parent_id, order_index, created_by
- **Resource:** id, folder_id, domain, title, type (pdf/link), url, created_by, created_at
- **Event:** id, title, description, date, venue, banner_url, registration_scope, status, created_by, created_at
- **EventRegistration:** id, event_id, user_id, attended, created_at
- **Quiz / QuizQuestion / QuizSubmission:** quiz metadata, questions (with hidden correct answer), one scored submission per email

(See `05_SYSTEM_DESIGN.md` for the full schema; `lib/db/src/schema/` is the source of truth.)

---

## 8. Non-Functional Requirements

- Glassmorphism visual design throughout
- Mobile responsive (students use phones)
- KIET email validation on recruitment form (`@kiet.edu`)
- Recruitment window toggle (on/off) controlled by core team
- Role changes are audited (who changed what, when)
- All file uploads type/size validated: PDF max 10MB
- Designed to scale to **5,000+ users** without redesign

---

## 9. API Security

| Layer | Control |
|---|---|
| Authorization (primary) | **Postgres RLS** on every table — default-deny, explicit per-role/domain policies; direct client access is only ever under RLS |
| Auth | **Supabase Auth** JWT; verified by RLS for direct access and by the trusted server (`verifySupabaseJwt`) on protected routes; role/domain loaded from DB, never trusted from client |
| HTTP headers | **Helmet v8** on the trusted server (CSP, HSTS, X-Frame-Options, no X-Powered-By) |
| Rate limiting | **express-rate-limit v7** — global + stricter on `/payments`, `/quizzes/submit`, `/uploads` |
| CORS | Allow-list of known origins (Android app + quiz site); credentials restricted |
| Input validation | **Zod** schemas validate every trusted-route body/query/param; SQL injection prevented by Drizzle parameterised queries |
| Request limits | JSON body cap (≈1MB) on the trusted server to prevent payload DoS |
| File uploads | Signed **Cloudinary** uploads with server-enforced type/size and randomized public IDs |
| Email validation | `@kiet.edu` enforced server-side (regex + domain check) |
| Quiz integrity | Correct answers never leave the server; scoring is server-only |
| Secrets | Supabase service-role key, Razorpay keys, Cloudinary secret only on the trusted server; never returned to clients |
| Transport | HTTPS only in production; certificate pinning enforced by the Android client |

---

## 10. Scalability (5,000+ users)

- **Supabase connection pooling (Supavisor)** bounds Postgres connections under high concurrency.
- **RLS pushes authorization into the database**, so ordinary reads/writes go client → Supabase directly with no app-tier fan-out.
- **Stateless trusted server** — JWT-verified, no session state → horizontal scaling behind a load balancer.
- **Key database indexes** (see System Design for the full table):
  - `profiles(email)`, `profiles(domain)`, `profiles(role)`
  - `attendance_records(session_id)`, `attendance_records(user_id)`
  - `recruitment_applications(status)`, `recruitment_applications(domain)`, `recruitment_applications(user_id)`
  - `event_registrations(event_id)`, `resource_folders(domain, parent_id)`, `quiz_submissions(quiz_id)`
- **Pagination** on all list endpoints (PostgREST range / SDK `.range()`) — never unbounded result sets.
- **Realtime-ready** — Supabase Realtime can add live features later without redesign.

---

## 11. Race Condition Prevention

- **Database transactions** on the trusted server wrap every multi-table write (e.g., Round 2 cleared → update application status → assign `member` role + domain) — all-or-nothing.
- **Unique constraints** as the final guard: `UNIQUE(session_id, user_id)` (attendance), `UNIQUE(event_id, user_id)` (event registration), `UNIQUE(user_id, academic_year)` (applications), `UNIQUE(quiz_id, email)` (quiz submissions). Attendance marking uses upsert/`ON CONFLICT` (with row locking where a read-modify-write is required).
- **Idempotency keys** on payment order creation; signature-verified, idempotent webhooks.
- **Optimistic concurrency** on edits (e.g., recruitment window toggle) using `updated_at` checks.
