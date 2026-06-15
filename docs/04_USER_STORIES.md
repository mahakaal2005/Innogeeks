# User Stories & Acceptance Criteria
## Club Innogeeks — Member & Club Management Platform

**Version:** 1.0  
**Date:** June 15, 2026  

---

## Epic 1: Authentication & Onboarding

### US-001 — Public visitor views club info
**As a** visitor with no account,  
**I want to** see the club's public page with domains, description, and events,  
**So that** I can learn about the club before deciding to join.

**Acceptance Criteria:**
- Public page loads without login
- All 5 domains are listed with brief descriptions
- Upcoming events are visible
- Recruitment banner shows "Open" or "Closed" based on current window
- No sensitive data (attendance, resources, applications) is visible

---

### US-002 — User signs up
**As a** visitor,  
**I want to** create an account with my email and password,  
**So that** I can register for events or apply for club membership.

**Acceptance Criteria:**
- Sign-up form: name, email, password
- Email verified before access granted
- Default role assigned: `public`
- Recruitment applicants must use `@kiet.edu` email (validated on registration form)

---

### US-003 — Coordinator/Core team account setup
**As a** coordinator or core team member,  
**I want** my account to have the correct role from day one,  
**So that** I can access the tools I need without waiting.

**Acceptance Criteria:**
- Core team manually adds them to the database with the correct role
- They sign up normally, and the role is pre-linked to their email
- OR core team promotes them from the admin panel after they sign up

---

## Epic 2: Recruitment

### US-010 — Applicant registers during open window
**As a** prospective member,  
**I want to** fill out the registration form during the open window,  
**So that** I can begin the application process.

**Acceptance Criteria:**
- Form only accessible when recruitment window is "Open"
- Required fields: name, roll number, KIET email (`@kiet.edu`), domain preference
- Email validated as `@kiet.edu` — non-KIET emails rejected with clear error
- Duplicate applications (same email) blocked
- On submit: application created with status `registered`

---

### US-011 — Applicant pays via UPI (Razorpay)
**As an** applicant,  
**I want to** pay the ₹50 fee by scanning a Razorpay UPI QR code in the app,  
**So that** my application moves to Round 1 qualified status automatically.

**Acceptance Criteria:**
- Razorpay UPI QR code displayed after registration (backend creates the order with an idempotency key)
- Applicant pays via any UPI app
- Razorpay webhook (signature-verified) auto-updates status to `round1_qualified` — no manual review, no screenshot
- Payment is idempotent (a retry never double-charges or double-approves)
- Applicant sees updated status on their dashboard

---

### US-012 — Applicant pays via cash
**As an** applicant who prefers cash,  
**I want to** submit cash payment and have it manually verified,  
**So that** I'm not excluded from applying.

**Acceptance Criteria:**
- Option to select "Cash Payment" on registration
- Status set to `cash_pending`
- Coordinator/core team sees applicant in "Pending Approvals" list
- Manual approval changes status to `round1_qualified`
- Rejection returns status to `payment_rejected` with a reason

---

### US-013 — Applicant tracks their status
**As an** applicant,  
**I want to** see my current stage in the recruitment pipeline,  
**So that** I know what to do next.

**Acceptance Criteria:**
- Dashboard shows current status clearly: `registered` → `round1_qualified` → `round2_qualified` → `selected` / `rejected`
- Each stage shows what happens next (e.g., "Take the Round 1 quiz on the quiz website")
- Status updates on refresh at minimum

---

### US-014 — Round 1 quiz results (auto-scored)
**As a** coordinator,  
**I want to** see which applicants passed the Round 1 quiz (taken on the quiz website),  
**So that** I can invite the qualified ones for the interview.

**Acceptance Criteria:**
- Applicant takes the Round 1 quiz on the quiz website (same API, Clerk auth)
- On submission the backend auto-scores and sets `round1_cleared` or `round1_failed` — no manual marking
- Coordinator sees the list of `round1_cleared` applicants in their domain
- Each result is logged with timestamp and the applicant's score

---

### US-015 — Coordinator/core team scores Round 2 interview
**As a** coordinator or core team member,  
**I want to** score candidates during the interview on defined criteria,  
**So that** final selection is fair and documented.

**Acceptance Criteria:**
- Interview panel sees list of `round1_cleared` applicants
- Can enter scores on rubric criteria (e.g., communication, domain knowledge, enthusiasm — 1–5 scale)
- Can add free-text notes
- Mark final outcome: `round2_cleared` or `round2_failed`
- On `round2_cleared`: system auto-assigns `member` role + domain tag to the user

---

### US-016 — Core team opens/closes recruitment
**As a** core team member,  
**I want to** toggle the recruitment window open or closed,  
**So that** registration only happens at the right time.

**Acceptance Criteria:**
- Toggle in core team settings panel
- When closed: registration form shows "Recruitment is currently closed" message
- Public page banner reflects current state
- Change is logged with timestamp

---

## Epic 3: Attendance

### US-020 — Coordinator creates an attendance session
**As a** coordinator,  
**I want to** create a new attendance session after each class,  
**So that** attendance is tracked per actual session, not a fixed schedule.

**Acceptance Criteria:**
- Form: domain (pre-filled based on coordinator's domain), title/topic, date
- Session appears in domain's attendance list immediately
- Only coordinators and core team can create sessions

---

### US-021 — Coordinator marks attendance
**As a** coordinator,  
**I want to** mark each student present or absent for a session,  
**So that** the club has an accurate attendance record.

**Acceptance Criteria:**
- List shows all active members in the coordinator's domain
- Each student has present/absent toggle (default: absent)
- Coordinator marks their own attendance too
- Save button commits the record
- Sessions older than 24 hours can still be edited by core team only

---

### US-022 — Member views own attendance
**As a** 1st year member,  
**I want to** see my attendance percentage and session history,  
**So that** I know if I'm at risk of falling below any threshold.

**Acceptance Criteria:**
- Dashboard shows overall attendance % for my domain
- List of all sessions: title, date, my status (present/absent)
- Color indicator: green (>75%), yellow (50–75%), red (<50%)

---

### US-023 — Coordinator views domain attendance
**As a** coordinator,  
**I want to** see attendance for all students in my domain,  
**So that** I can follow up with students who are falling behind.

**Acceptance Criteria:**
- Grid view: rows = students, columns = sessions
- Each cell shows P (present) or A (absent)
- Summary row shows % per student
- Summary column shows attendance count per session
- Sortable by attendance %

---

### US-024 — Core team views all-domain attendance
**As a** core team member,  
**I want to** see attendance across all domains,  
**So that** I can monitor overall club engagement.

**Acceptance Criteria:**
- Domain selector (Android, Web, ML, IoT, AR/VR) or combined view
- Same grid view as coordinator but across all domains
- Can switch between domains

---

## Epic 4: Resources

### US-030 — Coordinator creates a folder
**As a** coordinator,  
**I want to** create folders and sub-folders for my domain,  
**So that** resources are organized logically for students.

**Acceptance Criteria:**
- Create folder at root domain level or as a subfolder (max 2 levels deep)
- Folder name: required, max 50 characters
- Appears immediately in the domain resource view

---

### US-031 — Coordinator uploads a resource
**As a** coordinator,  
**I want to** upload a PDF or add a link inside a folder,  
**So that** students can access class materials after the session.

**Acceptance Criteria:**
- PDF upload: max 10MB, type validated (`.pdf` only)
- Link: title required, URL must be a valid format
- Resource appears inside the selected folder immediately
- Failed uploads show a clear error (file too large, wrong type, etc.)

---

### US-032 — Coordinator reorganizes resources
**As a** coordinator,  
**I want to** rename folders, move resources, and reorder folders,  
**So that** the structure stays clean as the semester progresses.

**Acceptance Criteria:**
- Rename folder: edit in place or via dialog
- Reorder folders: can manually set order (up/down buttons or numeric order)
- Move resource to another folder within the same domain
- Core team can do this across all domains

---

### US-033 — Member browses resources
**As a** 1st year member,  
**I want to** browse all domain resources (not just my domain),  
**So that** I can explore other domains or catch up on materials.

**Acceptance Criteria:**
- All 5 domains listed in resources section
- Can expand domain to see folder tree
- Can download PDFs or open links
- No upload controls visible to members

---

## Epic 5: Events

### US-040 — Coordinator/core team creates an event
**As a** coordinator or core team member,  
**I want to** create an event with all relevant details,  
**So that** students and the public know about it.

**Acceptance Criteria:**
- Form: title, description, date/time, venue, banner image (upload), registration scope
- Registration scope options: "Open to all" / "Club members only"
- Event published immediately or saved as draft
- Banner image: max 5MB, image formats only

---

### US-041 — Public event browsing
**As a** visitor (no login),  
**I want to** see all upcoming events,  
**So that** I can plan to attend even if I'm not a club member.

**Acceptance Criteria:**
- Events page accessible without login
- Shows title, date, venue, banner, brief description
- Shows registration eligibility label ("Open to all" / "Members only")
- Past events shown in separate "Past Events" section

---

### US-042 — User registers for an event
**As a** registered user,  
**I want to** register for an event I'm eligible for,  
**So that** the organizers know I'm attending.

**Acceptance Criteria:**
- "Register" button shown to eligible users
- Ineligible users see why they can't register (e.g., "Members only")
- Confirmation shown after registration
- User can see their registered events on their dashboard

---

### US-043 — Coordinator marks event attendance
**As a** coordinator or core team member,  
**I want to** mark which registered users actually attended an event,  
**So that** we have accurate participation records.

**Acceptance Criteria:**
- Available after the event date has passed
- List of all registered users with present/absent toggle
- Save commits the record

---

## Epic 6: Admin & Role Management

### US-050 — Core team manages user roles
**As a** core team member,  
**I want to** assign or change user roles,  
**So that** new coordinators and members are set up correctly.

**Acceptance Criteria:**
- Search user by name or email
- Change role: public → member, member → coordinator, etc.
- For member role: must also assign a domain
- All role changes logged (who changed, what changed, when)
- Cannot demote another core team member (only same-level or below)
