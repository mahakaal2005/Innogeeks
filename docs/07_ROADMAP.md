# Product Roadmap
## Club Innogeeks — Member & Club Management Platform

**Version:** 1.0  
**Date:** June 15, 2026  

---

## Phase 1 — MVP (v1.0) | Target: ~15 days

**Goal:** Launch a working platform for the next recruitment cycle.

| Module | Features |
|---|---|
| Auth | Clerk login, 4 roles, role assignment by core team |
| Public Page | Club info, domains, events listing, recruitment banner |
| Recruitment | Registration form, UPI QR + cash payment, status tracker, Round 1/2 marking, window toggle |
| Attendance | Session creation, mark attendance, member/coordinator/core views |
| Resources | Domain folders (2 levels), PDF upload, link upload, folder rename/reorder |
| Events | Create event, set scope (open/members), public listing, user registration, post-event attendance |
| Admin | Role management panel, role change audit log |

**Milestone:** First recruitment cycle processed entirely in-app (zero Google Forms)

---

## Phase 2 — v1.1 | Target: 4 weeks after v1.0

**Goal:** Polish, automation, and power features requested but deferred.

| Feature | Description |
|---|---|
| Email notifications | Registration confirmation, payment approved, round results, event reminders |
| Attendance export | Download attendance grid as CSV or PDF for any domain/session range |
| Custom event team rules | Define "min 1 member per team" and team size for hackathons |
| Drag-and-drop folder reorder | Visual reorganization of resource folders |
| Razorpay integration | Real payment gateway instead of manual QR screenshot flow |
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
| Mobile app (Expo) | Native iOS/Android app for attendance on the go |
| Moodle integration | Auto-import Round 1 test scores from Moodle API |
| Alumni view | 4th year specific lightweight view — event history, mentoring connections |
| Internal announcements | Core team posts club-wide announcements visible to all logged-in users |
| Domain sub-communities | Each domain has a mini-feed, pinned resources, coordinator intro |
| Certificate generation | Auto-generate participation/attendance certificates for events |

---

## Deferred / Parked

These were considered but intentionally not planned for any release yet:

| Feature | Reason Deferred |
|---|---|
| In-app chat / messaging | High complexity, low immediate value — WhatsApp handles this adequately for now |
| Automated Moodle Round 1 selection | Moodle API access needs institutional cooperation |
| 4th year alumni-specific role | 4th year = core team role in MVP; special view deferred to v2.0 |
| Payment reconciliation reports | Requires Razorpay integration (v1.1) first |

---

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| June 2026 | UPI QR + manual screenshot verification for MVP, not Razorpay | Razorpay requires business registration; faster to ship with manual flow |
| June 2026 | Max 2 levels of resource folder depth | Prevents over-nesting; coordinators confirmed this is sufficient |
| June 2026 | Moodle Round 1 results entered manually | No Moodle API access; manual entry is the accurate flow |
| June 2026 | 4th year uses core_team role | No functional difference needed in MVP; simplifies role system |
| June 2026 | No in-app chat in any near-term phase | Club uses WhatsApp effectively; chat is high effort for low delta |
