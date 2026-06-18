# Minimum Viable Product (MVP)
## Club Innogeeks — Member & Club Management Platform

**Version:** 1.0  
**Date:** June 15, 2026  

---

## What is the MVP?

The MVP is the smallest version of the platform that delivers real value to the club from day one. It ships as a **native Android app** (the client for all four roles), a **Supabase-native backend** (Postgres + Auth + RLS) with a thin trusted Express server, and a **quiz website** for the Round 1 recruitment test. It covers the three most time-sensitive pain points: recruitment (happens once a year, urgent), attendance (happens every week), and resources (needed immediately after each class). Events are included at a basic level. The public section is always included.

---

## MVP Scope

### ✅ Included in MVP

#### Platform
- **Android app** (Kotlin + Compose) — primary client for all 4 roles
- **Supabase backend** (Postgres + Auth + RLS, auto REST API) — single source of truth, shared by app and quiz site
- **Trusted Express server** — quiz auto-scoring, Round 2 → role assignment, Cloudinary upload signing
- **Quiz website** (React + Vite) — Round 1 test

#### Authentication & Roles
- Login via **Supabase Auth** (email + password; KIET email for applicants), used by the Android app and quiz site; RLS enforces all access
- 4 roles: public, member (1st year), coordinator, core_team
- Core team manually assigns coordinator and core_team roles via admin tools
- Member role auto-assigned after recruitment Round 2 clearance

#### Public Club Section (Android)
- Club description and 5 domains overview
- Upcoming events list (read-only)
- Recruitment open/closed banner

#### Recruitment
- Registration form (name, roll no., KIET email `@kiet.edu`, domain choice)
- **Manual Google Sheets** registration and cash/UPI payment flow → core team manually records as `round1_qualified`
- Applicant status tracker (which round they're on)
- **Round 1 quiz** on the quiz website — auto-scored, auto-updates `round1_status`
- Coordinator/core team: score and mark Round 2 interview
- Core team: open/close recruitment window
- Core team: view all applications with domain and status filters

#### Attendance
- Coordinator creates a session (domain, title, date)
- Coordinator marks present/absent for each student + self
- Member: view own attendance % and session history
- Coordinator: view full domain attendance grid
- Core team: view all domains attendance

#### Resources
- Domain-based folder structure (coordinator creates folders/subfolders, max 2 levels)
- Upload PDF (max 10MB) or add link
- Rename, reorder folders
- All members view all domain resources

#### Events
- Create event (title, description, date, venue, banner image)
- Set registration scope: open to all / members only
- Public event listing (no login needed)
- Registered users can register for eligible events
- Post-event attendance marking by coordinator/core team

---

### ❌ Deferred to v1.1+

- Custom event team composition rules (e.g., "min 1 member per team") — v1.1
- Drag-and-drop folder reordering — v1.1 (manual order index in MVP)
- Email notifications — v1.1
- Attendance export (CSV/PDF report) — v1.1
- In-app chat — future (architecture is WebSocket-ready)
- iOS app — not planned
- Alumni/4th year special view — v1.1

---

## MVP User Flow Summary

```
VISITOR
  └── Views public page (club info, events, recruitment banner)
  └── If recruitment open: fills registration form → pays → tracks status

APPLICANT (after payment)
  └── Status: payment_pending → round1_qualified → round2_qualified → member

MEMBER (after selection)
  └── Views own attendance
  └── Browses domain resources

COORDINATOR
  └── Creates attendance sessions → marks attendance
  └── Uploads/organizes domain resources
  └── Marks Round 1 / Round 2 for applicants in their domain
  └── Approves cash payment applications

CORE TEAM (superset of coordinator)
  └── All coordinator actions across all domains
  └── Opens/closes recruitment window
  └── Creates events
  └── Assigns/changes user roles
  └── Views all-domain attendance and all applications
```

---

## MVP Timeline Estimate

| Phase | Work | Estimated Time |
|---|---|---|
| 1 | Backend: Supabase schema + Auth + RLS policies + triggers + OpenAPI contract | 4 days |
| 2 | Trusted server: quiz scoring + Round 2 role assignment + Cloudinary signing | 4 days |
| 3 | Backend: security hardening, indexes, transactions, RLS review | 2 days |
| 4 | Quiz website (Round 1 test, auto-scoring) | 3 days |
| 5 | Android: project setup, modules, auth, navigation, theme | 4 days |
| 6 | Android: public + recruitment status tracker screens | 3 days |
| 7 | Android: attendance + resources + events screens | 5 days |
| 8 | Android: admin tools (roles, window toggle) | 2 days |
| 9 | End-to-end QA + polish across all 3 deployables | 4 days |
| **Total** | | **~34 days (≈ +3 weeks vs. web-only)** |

---

## Definition of Done (MVP)

- [ ] Android app builds and runs; all 4 roles can log in and see role-appropriate UI
- [ ] Quiz website auto-scores Round 1 and updates application status via the API
- [ ] Recruitment flow works end-to-end (register → pay → round 1 → round 2 → member)
- [ ] Coordinator can create a session and mark attendance; member sees their record
- [ ] Coordinator can upload a PDF/link; member can access it
- [ ] Core team can create an event visible to public
- [ ] Core team can open/close recruitment window
- [ ] Glassmorphism design applied consistently across all pages
- [ ] Mobile responsive (320px min width)
