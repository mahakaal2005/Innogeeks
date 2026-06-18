# 10 — User Flows

Exact, code-grounded user journeys for every user type in **Club Innogeeks**.
This is the reference we'll use when refining the UI.

> Each flow is tagged with where it actually stands today:
>
> - ✅ **Built** — implemented and working in code
> - 🟡 **Partial** — shell/placeholder exists, logic incomplete
> - ⬜ **Planned** — specced in `docs/` only, no working code yet
>
> Verified against `artifacts/api-server/src/routes/*`, `artifacts/quiz-site/src/*`,
> `artifacts/android/app/src/main/java/com/example/innogeeks/*`, and `lib/db/src/schema/*`.

---

## 1. The cast — user types

| User type | Who they are | Identity / auth |
| :--- | :--- | :--- |
| **Public / Prospective student** | Anyone visiting the site or app before joining | None |
| **Applicant** | A KIET student going through recruitment | KIET email; Supabase Auth (app) + email-only identity (quiz site) |
| **Member** | A selected student in one of the 5 domains | Supabase Auth, role `member` |
| **Coordinator** | Runs a single domain (android/web/ml/iot/arvr) | Supabase Auth, role `coordinator` |
| **Core team** | Runs the whole club | Supabase Auth, role `core_team` |

**Roles** (`role` enum): `public` → `member` → `coordinator` → `core_team`
**Domains** (`domain` enum): `android`, `web`, `ml`, `iot`, `arvr`

---

## 2. The surfaces — where flows happen

| Surface | Path / location | Auth model | Status |
| :--- | :--- | :--- | :--- |
| **Quiz site (public)** | `artifacts/quiz-site` `/` | No login (KIET email only) | ✅ Built |
| **Quiz site (admin)** | `artifacts/quiz-site` `/admin/club-info` | Supabase email+password login | ✅ Built |
| **Android app** | `artifacts/android` | Supabase Auth | 🟡 Auth + home shell only |
| **API server** | `artifacts/api-server` `/api` | Bearer JWT verified server-side | ✅ Built |

**Trust boundary:** Android + quiz site talk to Supabase directly (RLS enforces who
can read/write what). The Express API server only handles things that need
service-role trust or secrets: quiz scoring, role promotion, Cloudinary
signing, recruitment-window state.

---

## 3. Recruitment state machine (the spine of everything)

An applicant row (`recruitment_applications`) tracks **four independent fields**.
`status` is the headline; the other three are gates along the way.

```mermaid
stateDiagram-v2
    direction LR
    [*] --> registered: Register (KIET email, pick domain)
    registered --> round1_qualified: Coordinator shortlists
    round1_qualified --> round2_qualified: Round 2 cleared
    round1_qualified --> rejected: Round 2 failed
    round2_qualified --> selected: Core team assigns member role
    selected --> [*]: Now a member
    rejected --> [*]
```

Parallel gate fields (must line up before the next step):

| Field | Values | Set by |
| :--- | :--- | :--- |
| `payment_status` | `pending` → `cash_pending` → `approved` / `rejected` | UPI webhook (auto) **or** coordinator cash approval |
| `round1_status` | `pending` → `cleared` / `failed` | Quiz submit (auto-scored) |
| `round2_status` | `pending` → `cleared` / `failed` | Coordinator/core team Round 2 review |
| `status` | `registered` → `round1_qualified` → `round2_qualified` → `selected` / `rejected` | Shortlisting + Round 2 review + role assignment |

**Key gate to sit Round 1:** `payment_status = approved` **AND** `status = round1_qualified`
**AND** `round1_status = pending` **AND** an open recruitment window + published quiz
for the exact `academic_year`.

---

## 4. Public / Prospective student

**Goal:** learn about the club; during recruitment, find the way in.

### 4.1 Visiting the quiz site `/` — ✅ Built
```mermaid
flowchart TD
    A[Visit /] --> B[GET /api/recruitment/status]
    B --> C{testLive?}
    C -- false --> D[Club Info page<br/>hero · domains · gallery · contact]
    C -- true --> E[Recruitment Quiz home<br/>enter KIET email]
```
- `testLive` is true only when a recruitment window is **open** *and* a quiz is
  **published** for that year. Otherwise everyone sees the public Club Info page.
- Club Info content is read from `GET /api/club-info` (managed by core team).

### 4.2 Opening the Android app (before joining) — ⬜ Planned
- Spec: see "Onboarding Screen" with options to "Login" or "Continue as Guest".
- Guest View: Can see public club info, events, etc., but cannot log in or apply directly from the app (recruitment forms live on the web).

---

## 5. Applicant — the recruitment journey

This journey **spans two web surfaces**: the **Admin/Web Panel** (public registration form, pay fee via UPI QR) and the **quiz site** (no-login, invigilated PCs: Round 1 test). *Note: The mobile app is not used for recruitment.*

```mermaid
flowchart TD
    R[1. Register<br/>KIET email + domain + Form<br/>⬜ Google Sheets] --> P[2. Pay fee<br/>Manual Cash/UPI]
    P --> U[Core team inputs to DB<br/>payment_status=approved ✅]
    U --> S[3. Coordinator shortlists<br/>status=round1_qualified<br/>⬜ via Supabase/RLS]

    S --> Q[4. Round 1 quiz<br/>quiz site, invigilated ✅]
    Q -->|passed| C1[round1_status=cleared]
    Q -->|failed| F1[round1_status=failed]
    C1 --> R2[5. Round 2 interview<br/>POST /api/recruitment/review-round2 ✅]
    R2 -->|cleared| Q2[status=round2_qualified]
    R2 -->|failed| X[status=rejected]
    Q2 --> SEL[6. Core team selects<br/>POST /api/recruitment/assign-role<br/>→ becomes member ✅]
```

### Step detail

| # | Step | Surface | Mechanism | Status |
| :- | :--- | :--- | :--- | :--- |
| 1 | Register (Form: email, name, domain, etc.) | Web Panel | Direct Supabase insert / form submission | ⬜ Planned |
| 2a | Pay by **UPI** (First time only) | Web Panel | Shows QR code for payment; webhook `payment.captured` sets `payment_status=approved` | ✅ Built (server) / ⬜ UI |
| 2b | Pay by **cash** | In person | Coordinator/core team `POST /api/recruitment/approve-cash` (own domain only for coordinators) | ✅ Built (server) |
| 3 | Shortlist for Round 1 | Admin | Set `status=round1_qualified` via Supabase (RLS) based on form evaluation | ⬜ Gap |
| 4 | Round 1 quiz (testing round) | **Quiz site** | `validate-email` → `GET /quiz/:id` → `submit` (auto-scored) | ✅ Built |
| 5 | Round 2 interview (less crowd) | Admin | `POST /api/recruitment/review-round2` (requires `round1_status=cleared`) | ✅ Built (server) |
| 6 | Final selection | Core team | `POST /api/recruitment/assign-role` → `assign_member_role` RPC promotes to `member` | ✅ Built (server) |

### 5.1 Round 1 quiz (quiz site) — ✅ Built, step-by-step
```mermaid
flowchart TD
    A[Home: enter KIET email] --> B[POST /api/quiz/validate-email]
    B --> C{Result}
    C -- already submitted --> R[/result: show score/]
    C -- not eligible --> T[Toast: reason<br/>payment / not shortlisted / window closed]
    C -- canTake --> D[/quiz: GET /api/quiz/:id/]
    D --> E[Answer MCQs<br/>countdown timer]
    E -->|submit or timer hits 0| F[POST /api/quiz/:id/submit]
    F --> G[Server scores vs correct answers<br/>submit_quiz RPC]
    G --> R
```
Server guarantees (all enforced in `quiz.ts`):
- Only `@kiet.edu` emails.
- Window must be open for the applicant's exact `academic_year` (no year fallback).
- `GET /quiz/:id` never returns `correct_option_index`.
- Submit re-checks payment, shortlist, window, and that the quiz is the one assigned
  to the application; one attempt only.

---

## 6. Member — ⬜ mostly Planned (🟡 home shell)

**Goal:** day-to-day club life after selection.

| Flow | What they do | Status |
| :--- | :--- | :--- |
| Home dashboard | See role-based cards | 🟡 Shell in `HomeScreen.kt`, cards have no destination |
| Attendance | View personal attendance + session history | ⬜ Planned (schema exists) |
| Resources | Browse domain folders (PDFs/links) | ⬜ Planned |
| Events | See upcoming events, register if eligible | ⬜ Planned (`event_status`, `registration_scope` enums exist) |

```mermaid
flowchart LR
    L[Login ✅] --> H[Home dashboard 🟡]
    H --> A[Attendance ⬜]
    H --> R[Resources ⬜]
    H --> E[Events ⬜]
```

---

## 7. Coordinator — runs one domain

Inherits all member abilities, scoped to **their own domain**.

| Flow | Mechanism | Status |
| :--- | :--- | :--- |
| Approve cash payments (own domain) | `POST /api/recruitment/approve-cash` | ✅ Built (server) |
| Review Round 2 (own domain) | `POST /api/recruitment/review-round2` | ✅ Built (server) |
| Create attendance sessions + mark presence | Supabase (RLS) | ⬜ Planned |
| Manage resources (signed Cloudinary upload) | `POST /api/cloudinary/sign` + Supabase | 🟡 Signing built; UI planned |
| Coordinator tools entry | `HomeScreen.kt` card (role-gated) | 🟡 Placeholder only |

> Domain scoping is enforced server-side: a coordinator acting outside their
> `domain` gets `403`. Core team bypasses the domain check.

---

## 8. Core team — runs the club

Full access. Inherits coordinator + member abilities across **all domains**.

| Flow | Mechanism | Status |
| :--- | :--- | :--- |
| Open/close recruitment window | `POST /api/recruitment/window` | ✅ Built (server) |
| Final selection → promote to member | `POST /api/recruitment/assign-role` | ✅ Built (server) |
| Change any user's role/domain | `POST /api/admin/set-role` (can't change own) | ✅ Built (server) |
| Approve cash / review Round 2 (any domain) | same endpoints, no domain restriction | ✅ Built (server) |
| Edit public Club Info page | `PUT /api/club-info` (+ audit history row) | ✅ Built |
| View Club Info edit history | `GET /api/club-info/history` | ✅ Built |

### 8.1 Admin Web Panel Hub (quiz site `/admin`) — ⬜ Planned

Since recruitment and club management have moved away from the Android app, the `/admin` route on the Web Panel serves as the central hub for the `core_team` (and partially for `coordinator`s).

```mermaid
flowchart TD
    A[/admin] --> B{Logged in?}
    B -- no --> C[Email + password login<br/>Supabase Auth]
    B -- yes --> D[Admin Dashboard<br/>Metrics & Alerts]
    
    D -->|Click 'Members'| E[Manage Roles & Members<br/>POST /api/admin/set-role]
    D -->|Click 'Recruitment'| F[Recruitment Hub<br/>POST /api/recruitment/*]
    D -->|Click 'Events'| G[Events & Sessions]
    D -->|Click 'Broadcast'| H[Broadcast Center]
    D -->|Click 'Edit Website'| I[Club Info Editor<br/>PUT /api/club-info]
    
    I --> J[Save → History Refreshes]
```

> Any authenticated user can load the admin shell, but features are role-gated. Only `core_team` can save Club Info or manage all domains. `coordinator`s have restricted access to their domain's recruitment and events.

### 8.2 Android App Admin Drill-Down Flow — ✅ Built

The mobile app provides a dedicated **Admin Dashboard** and drill-down flow for `core_team` and `coordinator` roles to monitor the club on the go.

```mermaid
flowchart TD
    A[Admin Dashboard<br/>2x2 Stats Grid] -->|Tap a Domain| B[Domain Roster<br/>Coordinators & Members]
    B -->|Tap a Member| C[Member Profile<br/>Attendance & Recruitment Records]
```

**Key UI Details (Locked In):**
- **SaaS Dark Aesthetic**: Uses a `#050505` foundation, `#111` surface cards, and a frosted sticky header.
- **Data Density**: Simplified 2x2 stat grid (Members, Domains, Coordinators, New Joinees) without cluttered charts or actions.
- **Domain Directory**: Fast access to domain-specific rosters.
- **Deep Dive**: Individual member profiles prominently display their attendance ring and their Round 1 / Round 2 recruitment history.

---

## 9. Capability matrix (server-enforced)

| Capability | Public | Member | Coordinator | Core team |
| :--- | :--: | :--: | :--: | :--: |
| View Club Info / recruitment status | ✅ | ✅ | ✅ | ✅ |
| Take Round 1 quiz (if eligible) | ✅* | ✅* | ✅* | ✅* |
| Create UPI payment order | — | ✅ | ✅ | ✅ |
| Cloudinary signed upload | — | ✅ | ✅ | ✅ |
| Approve cash payment | — | — | ✅ own domain | ✅ all |
| Review Round 2 | — | — | ✅ own domain | ✅ all |
| Open/close recruitment window | — | — | — | ✅ |
| Assign member role (final selection) | — | — | — | ✅ |
| Change user roles | — | — | — | ✅ |
| Edit Club Info + view history | — | — | — | ✅ |

\* Quiz access is identity-by-KIET-email on invigilated PCs, gated by payment +
shortlist + open window — not by login role.

---

## 10. Known gaps to resolve before/while refining UI

1. **Registration has no trusted endpoint** — initial application insert relies on
   Supabase RLS directly; needs Web Panel UI.
2. **Shortlisting (`status=round1_qualified`) has no endpoint or UI** — currently a
   manual DB/RLS update. This is the one step with no front door.
3. **Android feature modules** (attendance, resources) are
   specced but not built. **Admin module** has been built (Drill-down flow). Recruitment has been moved out.
4. **Member/coordinator surfaces** (attendance, resources, events) exist in the DB
   schema and docs but have no UI.
5. **Single-open-window** isn't enforced at the DB level (see
   `.agents/memory/recruitment-window-invariant.md`).
