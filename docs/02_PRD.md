# Product Requirements Document (PRD)
## Club Innogeeks — Member & Club Management Platform

**Version:** 1.0  
**Date:** June 15, 2026  
**Status:** Draft  

---

## 1. Product Vision

A single platform where Club Innogeeks at KIET Group of Institutions manages everything — recruitment, attendance, resources, and events — while giving every user (from curious outsider to core team veteran) exactly the access and tools they need. The platform is delivered as a **native Android app** (the primary client for all roles) backed by one Express API, plus a small **quiz website** students use to take the Round 1 recruitment test.

---

## 2. Problem Statement

Currently, the club manages:
- Recruitment via separate Google Forms, manual payment tracking, and WhatsApp coordination
- Attendance via Excel sheets or physical registers
- Resources scattered across Google Drive, WhatsApp, and personal links
- Events announced via Instagram and WhatsApp groups

This creates fragmentation, data loss, no single source of truth, and a poor experience for both students and organizers.

---

## 3. Goals

1. **Centralize recruitment** — one place for registration, payment, shortlisting, and onboarding
2. **Digitize attendance** — coordinators create sessions and mark attendance from their phone
3. **Organize resources** — structured by domain with folder hierarchy, accessible to all members
4. **Manage events** — create, publish, and track event registrations with flexible eligibility rules
5. **Public presence** — give non-members a window into the club without requiring a login

---

## 4. User Personas

### 4.1 Priya — 1st Year Applicant (Non-member)
- Discovers Innogeeks through college orientation
- Installs the **Android app**, opens the public section to learn about domains
- Registers for recruitment during the open window, pays ₹50 via UPI QR in the app
- Takes the Round 1 quiz on the **quiz website** from a college computer
- Checks status in the app as she progresses through rounds
- If selected: becomes a member, sees her domain resources and attendance in the app

### 4.2 Arjun — 1st Year Club Member
- Already cleared recruitment, assigned to Web domain
- Uses the **Android app** to check resources his coordinator shared after class
- Checks his own attendance in the app before the minimum threshold warning

### 4.3 Sneha — Coordinator (2nd Year, ML Domain)
- Uses the **Android app** to create attendance sessions after each class she takes
- Marks present/absent for her 12 ML domain students from her phone
- Uploads PDFs and YouTube links organized by week
- Reviews interview rubric scores during recruitment

### 4.4 Rahul — Core Team (3rd Year)
- Uses the **Android app** to review overall attendance across all domains
- Creates and manages major college-level events (hackathons, workshops)
- Approves cash payment applications
- Manually assigns roles to new coordinators

---

## 5. User Stories

### Recruitment
- As an applicant, I can register during the open window using my KIET email
- As an applicant, I can pay ₹50 via UPI QR (Razorpay) inside the app and see my payment confirmed
- As an applicant, I can pay in cash and have a coordinator approve my payment manually
- As an applicant, I can take the Round 1 quiz on the quiz website and have my result recorded automatically
- As an applicant, I can see my current status (payment pending → round 1 → round 2 → selected/rejected)
- As a coordinator, I can see who passed Round 1 (auto-scored by the quiz site)
- As a coordinator, I can score and mark candidates during Round 2 interviews
- As core team, I can open and close the recruitment window
- As core team, I can view all applications with filters by domain, status, payment method

### Attendance
- As a coordinator, I can create a new attendance session for my domain with a title and date
- As a coordinator, I can mark each student present/absent and mark my own attendance
- As a member, I can see my attendance percentage and list of sessions I attended/missed
- As core team, I can see attendance for all domains in one view

### Resources
- As a coordinator, I can create folders and sub-folders for my domain
- As a coordinator, I can upload PDFs (max 10MB) or add links with a title
- As a coordinator, I can rename, move, or reorder folders at any time
- As a member, I can browse all domain resource folders and access files/links
- As core team, I can manage resources across all domains

### Events
- As a coordinator/core team, I can create an event with title, date, venue, banner image, description
- As an event creator, I can set registration scope: open to all / members only / custom rules
- As an event creator, I can define team composition rules (e.g., min 1 club member per team)
- As anyone, I can view all upcoming events without logging in
- As a registered user, I can register for an event I'm eligible for
- As a coordinator/core team, I can mark event attendance post-event

### Public Club Page
- As a visitor, I can see the club description and all 5 domains
- As a visitor, I can see upcoming events
- As a visitor, I can see if recruitment is open

---

## 6. Acceptance Criteria

| Feature | Criteria |
|---|---|
| Registration | Only `@kiet.edu` emails can apply for recruitment |
| Payment — UPI | Payment status auto-updates to `round1_qualified` after verification |
| Payment — Cash | Status is `cash_pending` until manually approved; visible to coordinator/core team |
| Attendance session | Session tied to specific domain; not editable after 24 hours |
| Attendance view | Member sees own %; coordinator sees domain grid; core team sees all |
| Resource upload | PDF max 10MB, type validated; link must be a valid URL |
| Folder management | Drag-and-drop reorder or manual reorder; sub-folder depth max 2 levels |
| Event scope | Scope validation runs at registration time, not just at display |
| Role assignment | Only core team can change roles; all changes are logged with timestamp |
| Recruitment window | Toggle in core team settings; public banner reflects current status |

---

## 7. Out of Scope (v1.0)

- In-app direct messaging or chat (architecture is WebSocket-ready for a future release)
- Push notifications (email only)
- **iOS app** — Android only in v1.0
- Standalone web frontend for members/organizers — the Android app is the client (the only website is the recruitment quiz site)
- Automated payment settlement/reconciliation
- Alumni portal (4th year core team uses the same core team role)

---

## 8. Success Metrics

- 100% of recruitment applications processed within the app (no Google Forms)
- Attendance marked digitally for every session (zero paper registers)
- All domain resources accessible in one place within 30 days of launch
- Core team can generate attendance and recruitment reports in < 1 minute
