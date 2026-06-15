# Technical Requirements Plan (TRP)
## Club Innogeeks — Member & Club Management Platform

---

## 1. System Overview

A platform for Club Innogeeks at KIET Group of Institutions, made up of three deployables sharing one backend:

1. **Backend API** (Express + PostgreSQL) — the single source of truth for all data.
2. **Android app** (Kotlin + Jetpack Compose) — the **primary client** used by all four roles (public, member, coordinator, core team).
3. **Quiz website** (React + Vite) — a lightweight site students open on college computers to take the Round 1 recruitment test; it auto-updates results back into the same backend.

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

---

## 3. Authentication & Identity

- **Login method:** Email + Password (KIET email — `@kiet.edu` — required for recruitment applicants)
- **Public users:** Can register with any email to view club info and events
- **Role assignment:**
  - Public: Default on signup
  - 1st Year Member: Assigned by core team after clearing Round 2 interview
  - Coordinator: Manually assigned by core team via the admin tools (role stored in the platform's PostgreSQL DB)
  - Core Team: Manually assigned by core team via the admin tools
- **Auth provider:** Clerk (role-based). The role and domain are stored in the platform's own PostgreSQL DB and synced from Clerk via webhook on signup.

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
- Registration form (name, roll no., KIET email, domain preference)
- Payment gateway:
  - UPI QR code payment → auto status: `payment_pending` → verified → `round1_qualified`
  - Cash payment → status: `cash_pending` → manual approval by coordinator/core team → `round1_qualified`
- Round 1: Online quiz taken on the **quiz website** (college computers). The quiz site uses the same backend API; on submission it auto-scores and updates `round1_status` (`cleared`/`failed`) — no manual entry.
- Round 2: Interview — coordinators + core team mark candidates on defined rubrics, mark as `round2_cleared`
- On clearing Round 2: system assigns `member` role + domain tag
- Recruitment window: activatable/deactivatable by core team (off by default)

### 5.2 Attendance Module
- Sessions created on-demand by coordinators (not predefined schedule)
- Session properties: domain, date, topic/title, created by
- Coordinator marks attendance for all domain students + marks their own
- Students see their own attendance percentage and session history
- Coordinators see full domain attendance grid
- Core team sees all domains combined

### 5.3 Resource Module
- Organized by domain at the top level
- Sub-folders creatable within each domain (e.g., Android > Week 1 Basics)
- Folder reorganization (rename, reorder, move) by coordinator of that domain or core team
- Resource types: PDF (file upload) and Link (URL)
- All members (1st year, coordinators, core team) can view all domain resources
- Upload restricted to coordinator (their domain) and core team

### 5.4 Events Module
- Events created by coordinators or core team
- Event properties: title, description, date/time, venue, banner image, registration scope, team rules
- Registration scope options:
  - Open to all (including non-members)
  - Club members only (1st year + coordinators + core team)
  - Custom (e.g., hackathon with "at least 1 club member per team")
- Everyone can view events publicly
- Event attendance marking post-event by coordinator/core team

### 5.5 Public Club Page
- Club description, domains, achievements
- Upcoming events listing
- Recruitment status banner (open/closed)
- No login required

---

### 6.1 Backend API

| Layer | Technology |
|---|---|
| Runtime | Node.js 24 + TypeScript 5.9 |
| Framework | Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod (`zod/v4`) + `drizzle-zod` |
| Auth | Clerk (role-based), JWT verified server-side |
| File Storage | Object Storage (Replit App Storage) for PDFs/banners |
| Payments | Razorpay (UPI QR) + manual cash flow |
| Security | Helmet v8, express-rate-limit v7, CORS, request size limits |
| API Contract | OpenAPI spec → Orval codegen |
| Hosting | Replit (dev) → Replit Deployments (prod) |

### 6.2 Android App (primary client)

| Layer | Technology |
|---|---|
| Language | Kotlin 2.4.0 |
| UI | Jetpack Compose (BOM 2026.05.00), Material 3, glassmorphism theme |
| Architecture | MVVM + Clean Architecture, multi-module |
| DI | Hilt 2.57.1 (via KSP) |
| Local DB | Room 2.8.4 (via KSP), offline-first single source of truth |
| Network | Retrofit 3.0.0 + OkHttp 5.4.0 (cert pinning, auth interceptor) |
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
| Backend | Same Express API (no separate backend, no Firebase/Supabase) |
| API Contract | Shared OpenAPI spec → Orval codegen |

---

## 7. Data Models (High Level)

- **User:** id, name, email, role (public/member/coordinator/core_team), domain, year, created_at
- **RecruitmentApplication:** id, user_id, domain, payment_status, round1_status, round2_status, score, created_at
- **AttendanceSession:** id, domain, title, date, created_by, created_at
- **AttendanceRecord:** id, session_id, user_id, is_present, marked_by, created_at
- **ResourceFolder:** id, domain, name, parent_folder_id, order_index, created_by
- **Resource:** id, folder_id, domain, title, type (pdf/link), url, created_by, created_at
- **Event:** id, title, description, date, venue, banner_url, registration_scope, created_by, created_at
- **EventRegistration:** id, event_id, user_id, team_name, status, created_at

---

## 8. Non-Functional Requirements

- Glassmorphism visual design throughout
- Mobile responsive (students use phones)
- KIET email validation on recruitment form (`@kiet.edu`)
- Recruitment window toggle (on/off) controlled by core team
- Role changes are audited (who changed what, when)
- All file uploads virus-free (type/size validation: PDF max 10MB)
- Designed to scale to **5,000+ users** without redesign

---

## 9. API Security

| Layer | Control |
|---|---|
| HTTP headers | **Helmet v8** (CSP, HSTS, X-Frame-Options, no X-Powered-By) |
| Rate limiting | **express-rate-limit v7** — global limit + stricter per-role limits on write/auth/payment routes |
| CORS | Allow-list of known origins only (Android app native calls + quiz site domain); credentials restricted |
| Auth | Clerk JWT verified on every protected route; role + domain loaded from DB, never trusted from the client |
| Authorization | RBAC middleware (`requireRole`, `requireDomain`) on every non-public route |
| Input validation | **Zod** schemas validate every request body, query, and param; reject on failure |
| Request limits | JSON/body size caps (e.g., 1MB JSON, 10MB multipart for PDFs) to prevent payload DoS |
| SQL injection | Parameterised queries only via **Drizzle ORM** — no string-concatenated SQL |
| File uploads | Server-side MIME sniffing (not just extension), size cap, randomized storage keys |
| Email validation | `@kiet.edu` enforced server-side (regex + domain check), not just client-side |
| Secrets | All keys in environment variables; never in source or returned to clients |
| Transport | HTTPS only in production; certificate pinning enforced by the Android client |

---

## 10. Scalability (5,000+ users)

- **Stateless Express API** — no in-memory session state, so the API can scale horizontally behind a load balancer.
- **PgBouncer connection pooling** — keeps a bounded pool of Postgres connections under high concurrency.
- **Redis caching layer** — cache hot, read-heavy data (recruitment window status, attendance summaries, public events, session-auth lookups) with short TTLs and explicit invalidation on writes.
- **Key database indexes** (see System Design for the full table):
  - `users(email)`, `users(domain)`, `users(role)`
  - `attendance_records(session_id)`, `attendance_records(user_id)`
  - `recruitment_applications(status)`, `recruitment_applications(domain)`, `recruitment_applications(user_id)`
  - `event_registrations(event_id)`, `resource_folders(domain, parent_id)`
- **Pagination** on all list endpoints (applications, users, sessions) — never return unbounded result sets.
- **WebSocket-ready** — because sessions are stateless and auth is JWT-based, real-time features (e.g., future in-app chat) can be added via Socket.io with a Redis adapter **without redesigning** the API.

---

## 11. Race Condition Prevention

- **Database transactions** wrap every multi-table write so it is all-or-nothing. Example: marking Round 2 cleared → update application status → assign `member` role + domain — committed in a single transaction.
- **`SELECT ... FOR UPDATE`** (row locking) when marking attendance, so two coordinators marking the same student in the same session cannot create a double write; combined with a `UNIQUE(session_id, user_id)` constraint as the final guard.
- **Idempotency keys** on payment endpoints — a client-supplied key makes retries safe (a duplicate submit does not create a second payment record or double-approve).
- **Unique constraints** as the last line of defense: `UNIQUE(session_id, user_id)` on attendance, `UNIQUE(event_id, user_id)` on event registration, `UNIQUE(user_id, academic_year)` on applications.
- **Optimistic concurrency** on edits (e.g., recruitment window toggle) using `updated_at` checks to detect conflicting concurrent updates.
