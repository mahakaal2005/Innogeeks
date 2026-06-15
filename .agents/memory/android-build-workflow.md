---
name: Android app build workflow
description: How the native Android app is developed given Replit can't build Android
---

# Android app (Club Innogeeks) — build & collaboration workflow

**Constraint:** The Replit container has NO JDK, Gradle, Kotlin, or Android SDK, and
no emulator. Native Android (Kotlin + Jetpack Compose) **cannot be compiled, run, or
verified inside Replit.** Do not try to install the Android SDK to "build" it here.

**Agreed workflow (round-trip via GitHub):**
1. User creates the blank Android project in **Android Studio** on their machine
   (Android Studio generates the Gradle wrapper jar — the binary the agent can't make).
2. User connects the Repl to GitHub via the **Git pane** and pushes; clones locally.
3. Agent pulls the pushed project in Replit and fills in the Clean Architecture code
   (modules, DI, network, DB, features) — agent writes source only, never compiles.
4. User builds/runs in Android Studio, pushes changes, agent Pulls and continues.

**Why:** Replit can host the source and the agent can write Kotlin, but compilation/
run/verification must happen in Android Studio. Splitting it this way keeps a working
toolchain (AS) as the source of truth for "does it build".

**Conventions agreed:** app package/namespace `com.innogeeks.app`; min SDK 26;
multi-module per `docs/08_ANDROID_ARCHITECTURE.md`; Supabase-native (Supabase Kotlin
SDK for Auth+Postgrest) + thin Express server for Razorpay/quiz/role/Cloudinary.
