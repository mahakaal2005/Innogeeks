# Technical Requirements Plan (TRP)
## Club Innogeeks — Member & Club Management Platform

---

## 1. System Overview

A full-stack web application for Club Innogeeks at KIET Group of Institutions. It serves four distinct user roles across the club's lifecycle — from public visitors discovering the club to core team members managing operations. The platform handles recruitment (with payment), attendance tracking, resource sharing, and event management.

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
  - 1st Year Member: Assigned by coordinator/core team after clearing Round 2 interview
  - Coordinator: Manually added to Firestore/Supabase by core team
  - Core Team: Manually added to Firestore/Supabase by core team
- **Auth provider:** To be decided (Clerk or Supabase Auth recommended for role management)

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
- Round 1: External (Moodle) — coordinators/core team manually mark students as `round1_cleared`
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

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (TypeScript) |
| Styling | Tailwind CSS + Glassmorphism custom theme |
| State / Data | TanStack Query (React Query) |
| Backend | Express.js (Node.js) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Clerk (role-based) |
| File Storage | Supabase Storage or Object Storage (PDFs) |
| Payments | Razorpay (UPI QR) + manual cash flow |
| API Contract | OpenAPI spec → Orval codegen |
| Hosting | Replit (dev) → Replit Deployments (prod) |

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
