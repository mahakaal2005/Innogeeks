# Android Architecture
## Club Innogeeks — Native Android App

**Version:** 1.0  
**Date:** June 15, 2026  
**Platform:** Android (Kotlin + Jetpack Compose)  

---

## 1. Overview

The Club Innogeeks Android app is the **primary client** for all users — public visitors, 1st year members, coordinators, and core team. It connects **directly to Supabase** (Auth + Postgrest, guarded by RLS) for most data, and to a thin **trusted Express server** for payments, quiz take/submit, Round 2 → role assignment, and Cloudinary upload signing (same backend as the quiz site). It is built with Kotlin + Jetpack Compose using **MVVM + Clean Architecture**, with **KSP** for all annotation processing (no KAPT).

iOS is **not** in scope. The quiz is **not** taken on this app — it is taken on the separate quiz website on college computers.

---

## 2. Architecture: MVVM + Clean Architecture

Three layers, strict dependency direction (UI → Domain → Data; Domain depends on nothing):

```
┌──────────────────────────────────────────────────────────┐
│  UI LAYER                                                  │
│  Composable screens  +  ViewModel (StateFlow / UiState)   │
│  - Collects state via collectAsStateWithLifecycle()       │
│  - Sends events to ViewModel                              │
└───────────────────────────┬──────────────────────────────┘
                            │  calls
┌───────────────────────────▼──────────────────────────────┐
│  DOMAIN LAYER (pure Kotlin, no Android deps)              │
│  Use Cases (single responsibility)                        │
│  Repository interfaces                                     │
│  Domain models                                            │
└───────────────────────────┬──────────────────────────────┘
                            │  implemented by
┌───────────────────────────▼──────────────────────────────┐
│  DATA LAYER                                                │
│  Repository implementations                               │
│  Remote: Retrofit API + DTOs                              │
│  Local:  Room DAOs + entities                             │
│  Prefs:  Encrypted DataStore                              │
│  Mappers: DTO ↔ Domain ↔ Entity                          │
└──────────────────────────────────────────────────────────┘
```

**Single source of truth:** The UI always observes Room via `Flow`. The repository fetches from the API, writes to Room, and the UI updates reactively. This is the **offline-first** pattern — the app works from cache, network refreshes it.

---

## 3. Module Structure (multi-module Gradle)

```
:app                  — Application class, Hilt setup, root NavHost, MainActivity
:core:network         — Supabase Kotlin SDK client (Auth + Postgrest) + Retrofit/OkHttp for trusted endpoints, interceptors, DTOs
:core:database        — Room database, DAOs, entities, type converters
:core:datastore       — EncryptedDataStore, preference keys (auth token, user prefs)
:core:ui              — Compose theme, glassmorphism components, design tokens, shared widgets
:core:common          — Result wrapper, dispatchers, extensions, constants
:feature:auth         — Login (Supabase Auth), session/token management, AuthViewModel
:feature:recruitment  — Status tracker
:feature:attendance   — Session list, mark attendance, attendance summary
:feature:resources    — Domain folder tree, resource viewer, upload
:feature:events       — Event list, detail, registration
:feature:admin        — Role management, recruitment window, coordinator tools
```

Each `:feature:*` module contains its own `ui/`, `domain/`, and `data/` packages.

---

## 4. Tech Stack — Verified Stable Versions (June 2026)

```kotlin
// gradle/libs.versions.toml  (Version Catalog)

[versions]
kotlin = "2.4.0"
ksp = "2.4.0-2.3.9"
agp = "8.13.0"
composeBom = "2026.05.00"
hilt = "2.57.1"
room = "2.8.4"
retrofit = "3.0.0"
okhttp = "5.4.0"
navigation3 = "1.0.0"
coil = "3.5.0"
coroutines = "1.11.0"
datastore = "1.2.1"
serialization = "1.10.0"
lifecycle = "2.9.0"

[libraries]
# Compose
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version = "1.10.0" }

# Lifecycle / ViewModel
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycle" }
androidx-lifecycle-runtime-compose = { group = "androidx.lifecycle", name = "lifecycle-runtime-compose", version.ref = "lifecycle" }

# Navigation 3
androidx-navigation3-runtime = { group = "androidx.navigation3", name = "navigation3-runtime", version.ref = "navigation3" }
androidx-navigation3-ui = { group = "androidx.navigation3", name = "navigation3-ui", version.ref = "navigation3" }

# Hilt (DI) — via KSP
hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler = { group = "com.google.dagger", name = "hilt-android-compiler", version.ref = "hilt" }
androidx-hilt-navigation-compose = { group = "androidx.hilt", name = "hilt-navigation-compose", version = "1.2.0" }

# Room — via KSP
room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }

# Network
retrofit = { group = "com.squareup.retrofit2", name = "retrofit", version.ref = "retrofit" }
retrofit-kotlinx-serialization = { group = "com.squareup.retrofit2", name = "converter-kotlinx-serialization", version.ref = "retrofit" }
okhttp = { group = "com.squareup.okhttp3", name = "okhttp", version.ref = "okhttp" }
okhttp-logging = { group = "com.squareup.okhttp3", name = "logging-interceptor", version.ref = "okhttp" }

# Serialization
kotlinx-serialization-json = { group = "org.jetbrains.kotlinx", name = "kotlinx-serialization-json", version.ref = "serialization" }

# Coroutines
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }

# DataStore (encrypted prefs)
androidx-datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }

# Coil (image loading)
coil-compose = { group = "io.coil-kt.coil3", name = "coil-compose", version.ref = "coil" }
coil-network-okhttp = { group = "io.coil-kt.coil3", name = "coil-network-okhttp", version.ref = "coil" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
```

---

## 5. KSP Setup (No KAPT)

Both Room and Hilt use **KSP** for annotation processing. KAPT is deprecated and significantly slower.

```kotlin
// app/build.gradle.kts
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
}

dependencies {
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)        // KSP, not kapt

    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)        // KSP, not kapt
}
```

---

## 6. Concurrency & Race Condition Safety

- **All Room queries** are `suspend` functions or return `Flow` — never blocking calls on the main thread.
- **Multi-step DB writes** use `@Transaction` (DAO) or `withTransaction { }` (database) so partial writes can't corrupt state.
- **ViewModels** launch work in `viewModelScope`; collection uses `flowOn(Dispatchers.IO)` for IO-bound work.
- **No shared mutable state** across coroutines — state lives in a single `MutableStateFlow` per ViewModel, updated via `update { }`.
- **Idempotent network writes** — write operations (attendance mark) include a client-generated request key, so a retry never double-applies.
- **Single source of truth** — the UI never holds its own copy of server state; it observes Room. This eliminates the class of bugs where two screens disagree.
- **Optimistic updates** are written to Room first, then confirmed by the API; on failure they roll back from the next API fetch.

---

## 7. Security Hardening

| Concern | Mitigation |
|---|---|
| Man-in-the-middle | **Certificate pinning** via OkHttp `CertificatePinner` on the API host |
| Secrets in source | None in source — API base URL and keys via `local.properties` → `BuildConfig`; never committed |
| Reverse engineering | **R8/ProGuard** minify + obfuscate on release build |
| Cleartext traffic | **Network Security Config** blocks all cleartext (HTTPS only) |
| Token theft | Auth token in **Encrypted DataStore** (Tink-backed); cleared on logout |
| Rooted devices | Root-detection check; warn user and restrict sensitive actions |
| Logging leaks | Timber release tree strips all logs; no PII or tokens ever logged |
| Input | All form inputs validated client-side AND server-side (KIET email, file size/type) |

### OkHttp Auth Interceptor
```kotlin
class AuthInterceptor(private val tokenProvider: () -> String?) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokenProvider()
        val request = chain.request().newBuilder().apply {
            token?.let { addHeader("Authorization", "Bearer $it") }
        }.build()
        return chain.proceed(request)
    }
}
```

### Certificate Pinning
```kotlin
val certificatePinner = CertificatePinner.Builder()
    .add("api.innogeeks.example", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
    .build()
```

---

## 8. Authentication Flow (Supabase Auth)

1. User enters email + password → the **Supabase Kotlin SDK** signs in (`auth.signInWith(Email)`).
2. Supabase returns an access token (JWT) + refresh token; the SDK manages the session.
3. The app mirrors the JWT into **Encrypted DataStore** for the OkHttp interceptor used on trusted-server calls.
4. Direct Supabase calls (Postgrest) are authorized by **RLS** using the session JWT; trusted-server calls attach `Authorization: Bearer <jwt>` via the interceptor.
5. On token expiry, the SDK silently refreshes; if refresh fails, the user is routed to login.
6. Logout clears the Supabase session + DataStore + wipes the Room cache.

---

## 9. Navigation 3 (Nav3)

Navigation 3 (`1.0.0`, the new stable standard released Nov 2025) with type-safe routes and a back-stack the app owns directly.

```kotlin
@Serializable data object PublicHome
@Serializable data object Login
@Serializable data class MemberDashboard(val tab: String = "attendance")
@Serializable data class ResourceFolder(val domain: String, val folderId: String?)
@Serializable data class EventDetail(val eventId: String)
```

Auth-gated routes check the token in DataStore; if absent, the back stack redirects to `Login`.

---

## 10. Offline-First Data Flow (example: attendance)

```
UI observes  attendanceDao.observeMySummary(): Flow<Summary>
   ↑                                              │
   │ (reactive)                                   │
ViewModel ──────────────────────────────────────┘
Repository.refreshAttendance():
   1. api.getMyAttendance()      (network)
   2. attendanceDao.upsertAll()  (write to Room)
   3. Room emits → UI updates automatically
On network error: UI keeps showing cached Room data + shows offline banner.
```

---

## 11. Glassmorphism on Android

Material 3 with a custom dark theme. Glass effect achieved via translucent `Surface` + blur:

- Translucent surfaces: `Color.White.copy(alpha = 0.07f)` over the gradient background
- Blur: `Modifier.blur()` for backdrop where supported (API 31+); fallback to translucent surface on older devices
- Domain accent colors match the web design system (Android=green, Web=blue, ML=purple, IoT=orange, AR/VR=pink)
- Fonts: Space Grotesk (headings) + Inter (body) via `androidx.compose.ui.text.googlefonts`
- Dark theme enforced (the brand is dark-first)

---

## 12. Testing Strategy

- **Unit tests** — Use Cases and ViewModels (JUnit + Turbine for Flow + MockK)
- **Repository tests** — fake API + in-memory Room
- **UI tests** — Compose test rule for critical screens (login, attendance mark)
- **DAO tests** — Room in-memory database tests for query correctness and transactions
