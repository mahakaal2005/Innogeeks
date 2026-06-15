# Minimum Viable Product (MVP)
## Club Innogeeks — Member & Club Management Platform

**Version:** 1.0  
**Date:** June 15, 2026  

---

## What is the MVP?

The MVP is the smallest version of the platform that delivers real value to the club from day one. It covers the three most time-sensitive pain points: recruitment (happens once a year, urgent), attendance (happens every week), and resources (needed immediately after each class). Events are included at a basic level. The public page is always included.

---

## MVP Scope

### ✅ Included in MVP

#### Authentication & Roles
- Email + password login (Clerk)
- 4 roles: public, member (1st year), coordinator, core_team
- Core team manually assigns coordinator and core_team roles via admin panel
- Member role auto-assigned after recruitment Round 2 clearance

#### Public Club Page
- Club description and 5 domains overview
- Upcoming events list (read-only)
- Recruitment open/closed banner

#### Recruitment
- Registration form (name, roll no., KIET email `@kiet.edu`, domain choice)
- UPI QR code payment flow (manual verification step) → status: `round1_qualified`
- Cash payment flow → status: `cash_pending` → manual approval by coordinator/core team
- Applicant status tracker (which round they're on)
- Coordinator/core team: mark Round 1 pass/fail
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
- Automated Razorpay payment gateway integration — v1.1 (UPI QR + cash in MVP)
- Drag-and-drop folder reordering — v1.1 (manual order index in MVP)
- Email notifications — v1.1
- Attendance export (CSV/PDF report) — v1.1
- Moodle API integration — deferred indefinitely (manual entry)
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
| 1 | Auth + role system + DB schema | 2 days |
| 2 | Public page + club info | 1 day |
| 3 | Recruitment flow (form + payment + status) | 3 days |
| 4 | Attendance module | 2 days |
| 5 | Resources module | 2 days |
| 6 | Events module (basic) | 2 days |
| 7 | Core team admin panel (roles, window toggle) | 1 day |
| 8 | QA + polish | 2 days |
| **Total** | | **~15 days** |

---

## Definition of Done (MVP)

- [ ] All 4 roles can log in and see role-appropriate UI
- [ ] Recruitment flow works end-to-end (register → pay → round 1 → round 2 → member)
- [ ] Coordinator can create a session and mark attendance; member sees their record
- [ ] Coordinator can upload a PDF/link; member can access it
- [ ] Core team can create an event visible to public
- [ ] Core team can open/close recruitment window
- [ ] Glassmorphism design applied consistently across all pages
- [ ] Mobile responsive (320px min width)
