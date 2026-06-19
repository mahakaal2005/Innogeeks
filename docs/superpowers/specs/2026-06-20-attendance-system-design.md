# Attendance System Design Spec
**Date:** 2026-06-20
**Scope:** Coordinator Attendance Flow (MVP Phase 7)

## 1. Overview
The Attendance system allows domain coordinators to create attendance sessions, view the members in their domain, and mark members present or absent. This feature interacts directly with the Supabase API via the Express backend.

## 2. Architecture & Data Flow
- **Express API Endpoints**:
  - `GET /api/domains/:domain/members` -> returns domain member profiles.
  - `GET /api/attendance/sessions?domain=:domain` -> returns list of past sessions.
  - `POST /api/attendance/sessions` -> creates a new session.
  - `GET /api/attendance/sessions/:id/records` -> returns current records.
  - `PUT /api/attendance/sessions/:id/records` -> bulk updates present/absent array.
- **Android Data Layer**:
  - `AttendanceRepository` powered by Ktor to handle network calls and map responses to domain models.
  - Uses generic `Result<T, DataError>` wrapper for error handling.
- **Android Presentation Layer**:
  - `CoordinatorAttendanceViewModel` using MVI (State: session list, selected session, members list, mutated attendance set).
  - Uses `UiText` for error mapping.
  - Uses `PersistentList` from `kotlinx.collections.immutable` to ensure stable UI recomposition.

## 3. UI/UX Design
Adhering to the `ui-ux-pro-max` guidelines:
- **Session List Screen**:
  - A clean `LazyColumn` showing past sessions as `GlassCard` items (Title, Date, Present Count).
  - Floating action button (FAB) to create a new session.
- **Create Session Sheet**:
  - Glassmorphism bottom sheet or dialog.
  - Input: Session Title (Date defaults to today).
- **Roster Screen (The List)**:
  - **Header**: Shows the Session Title, Date, and a live counter (e.g., "14 / 30 Present").
  - **The Rows**: The entire row acts as a toggle.
    - *Absent (Default)*: Glass border, subtle text.
    - *Present (Tapped)*: Smooth transition to a solid Electric Cyan background with white text.
  - **Save Action**: Sticky `PrimaryButton` at the bottom to commit the attendance batch.

## 4. Error Handling
- Network failures during the batch save operation will result in a localized `UiText` error message so the coordinator can retry.
- Empty states (no members found, no sessions found) will display informative empty state illustrations or text.

## 5. Testing
- `AttendanceViewModel` unit tests using JUnit5, Turbine, and AssertK.
- Fake `AttendanceRepository` to simulate network success/failure flows.
