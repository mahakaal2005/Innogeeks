# Product Roadmap
## Club Innogeeks — Member & Club Management Platform

**Version:** 1.0  
**Date:** June 15, 2026  

---

## Phase 1 — MVP (v1.0) | Target: ~34 days

**Goal:** Launch a working platform — Android app + backend API + quiz site — for the next recruitment cycle.

| Deployable / Module | Features |
|---|---|
| **Backend API** | Express + PostgreSQL, OpenAPI contract, RBAC, security hardening, indexes, transactions |
| **Android app** | Kotlin + Compose (MVVM/Clean Arch), offline-first, primary client for all 4 roles |
| **Quiz website** | React + Vite, Round 1 test, auto-scoring → updates `round1_status` via the same API |
| Auth | Clerk login, 4 roles, role assignment by core team |
| Public Section | Club info, domains, events listing, recruitment banner (in app) |
| Recruitment | Registration form, **Razorpay UPI QR** + cash payment, status tracker, Round 1 quiz + Round 2 marking, window toggle |
| Attendance | Session creation, mark attendance, member/coordinator/core views |
| Resources | Domain folders (2 levels), PDF upload, link upload, folder rename/reorder |
| Events | Create event, set scope (open/members), public listing, user registration, post-event attendance |
| Admin | Role management, role change audit log |

**Milestone:** First recruitment cycle processed entirely in-app (zero Google Forms), with Round 1 auto-scored on the quiz site

---

## Phase 2 — v1.1 | Target: 4 weeks after v1.0

**Goal:** Polish, automation, and power features requested but deferred.

| Feature | Description |
|---|---|
| Email notifications | Registration confirmation, payment approved, round results, event reminders |
| Attendance export | Download attendance grid as CSV or PDF for any domain/session range |
| Custom event team rules | Define "min 1 member per team" and team size for hackathons |
| Drag-and-drop folder reorder | Visual reorganization of resource folders |
| Recruitment analytics | Funnel view: registered → paid → round1 → round2 → selected per domain |
| Search | Global search across resources, events, and members |

---

## Phase 3 — v1.2 | Target: 8 weeks after v1.0

**Goal:** Data-driven insights and richer communication.

| Feature | Description |
|---|---|
| Attendance alerts | Auto-flag members who drop below 75% threshold |
| Coordinator dashboard | Per-domain stats: session count, avg attendance, resource count, upcoming events |
| Core team analytics dashboard | Cross-domain health view, recruitment funnel, event participation trends |
| Resource versioning | Update a PDF without losing the old version |
| Event calendar view | Calendar-style view of all events |
| Bulk attendance import | Upload CSV for attendance when coordinator forgot to mark digitally |

---

## Phase 4 — v2.0 | Target: Next academic year

**Goal:** Platform maturity — self-service, integrations, scale.

| Feature | Description |
|---|---|
| iOS app | Native iOS client (Android ships in v1.0; iOS deferred to v2.0) |
| In-app chat | Real-time chat via Socket.io + Redis (API is already WebSocket-ready) |
| Alumni view | 4th year specific lightweight view — event history, mentoring connections |
| Internal announcements | Core team posts club-wide announcements visible to all logged-in users |
| Domain sub-communities | Each domain has a mini-feed, pinned resources, coordinator intro |
| Certificate generation | Auto-generate participation/attendance certificates for events |

---

## Deferred / Parked

These were considered but intentionally not planned for any release yet:

| Feature | Reason Deferred |
|---|---|
| In-app chat / messaging | Deferred to v2.0; the API is intentionally WebSocket-ready so it can be added without redesign |
| 4th year alumni-specific role | 4th year = core team role in MVP; special view deferred to v2.0 |
| iOS app | Android-only in v1.0; iOS deferred to v2.0 |
| Payment reconciliation reports | Built on top of the v1.0 Razorpay integration |

---

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| June 2026 | Razorpay UPI QR in MVP (not manual screenshots) | Automated, verifiable, idempotent payments; removes manual review for UPI |
| June 2026 | Android native app is the primary client; no web frontend for members/organizers | User requirement; one app + one API + one quiz site |
| June 2026 | Round 1 is an online quiz on a separate website using the same API (no Moodle, no Firebase/Supabase) | Auto-scores and updates status; one backend is the single source of truth |
| June 2026 | Kotlin 2.4.0 + Compose BOM 2026.05.00 | Latest stable verified June 2026 |
| June 2026 | KSP over KAPT | KSP is the modern standard; KAPT is deprecated and slower |
| June 2026 | Navigation 3 over Navigation 2 | Nav3 is the new stable standard with app-owned back stack + type-safe routes |
| June 2026 | MVVM + Clean Architecture, offline-first (Room single source of truth) | Testable, scalable, works offline |
| June 2026 | Architecture WebSocket-ready (stateless API + JWT) | In-app chat can be added later via Socket.io without redesign |
| June 2026 | Scale target 5,000+ users (PgBouncer, Redis, indexes, pagination) | Production-grade scalability from day one |
| June 2026 | Max 2 levels of resource folder depth | Prevents over-nesting; coordinators confirmed this is sufficient |
| June 2026 | 4th year uses core_team role | No functional difference needed in MVP; simplifies role system |
