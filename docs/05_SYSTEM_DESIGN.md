# System Design Document
## Club Innogeeks — Member & Club Management Platform

**Version:** 1.0  
**Date:** June 15, 2026  

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│   React + Vite + TanStack Query + Tailwind (Glassmorphism)  │
└───────────────────────┬─────────────────────────────────────┘
                        │  HTTP/REST (OpenAPI contract)
┌───────────────────────▼─────────────────────────────────────┐
│                    EXPRESS.JS API SERVER                      │
│   Route handlers → Zod validation → Drizzle ORM             │
└──────┬─────────────────────────┬────────────────────────────┘
       │                         │
┌──────▼──────┐          ┌──────▼──────────┐
│  PostgreSQL  │          │  File Storage    │
│  (Drizzle)  │          │  (Object Storage │
│             │          │   for PDFs)      │
└─────────────┘          └─────────────────┘
       │
┌──────▼──────┐
│    Clerk    │
│  (Auth +    │
│   Roles)    │
└─────────────┘
```

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
payment_proof   text NULLABLE (URL to screenshot)
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

### UPI Path
```
Applicant submits form
  → status: 'registered'
  → UPI QR shown in app
  → Applicant uploads payment screenshot
  → status: 'payment_pending'
  → Coordinator/core team reviews screenshot
  → Approve → status: 'round1_qualified'
  → Reject → status: 'payment_rejected' (with reason)
```

### Cash Path
```
Applicant selects "Cash" on form
  → status: 'cash_pending'
  → Coordinator/core team sees in "Pending Approvals" queue
  → Manual approval → status: 'round1_qualified'
```

---

## 6. File Storage Strategy

- PDFs uploaded to Object Storage (Replit App Storage)
- Storage path convention: `resources/{domain}/{folder_id}/{filename}`
- Event banners: `events/{event_id}/banner.{ext}`
- Payment screenshots: `payments/{application_id}/proof.{ext}`
- Presigned URLs used for direct browser uploads (reduces server load)
- Max sizes enforced both client-side (UX) and server-side (validation)

---

## 7. Security Considerations

- All API routes authenticated (except public events + club info endpoints)
- Domain scoping: coordinators can only write to their own domain
- Role elevation: only core_team can promote users
- File type validation server-side (MIME type check, not just extension)
- KIET email validation: regex + domain check on server
- Recruitment window state checked server-side on every application submission
- All destructive actions (delete folder, reject application) require confirmation
