---
name: Android sign-in token ordering vs RLS
description: Why any authenticated Supabase call made between sign-in and session-save must cache the access token first, or RLS returns empty rows.
---

# Android sign-in: cache the token before any pre-session authenticated call

The Android OkHttp interceptor attaches `Authorization` from `SessionStore.cachedAccessToken`. That cache is only populated by `save()` (full session) / `preload()` (app start). So any REST call made **after sign-in but before `save()`** (e.g. the profile lookup in `AuthRepository.signIn`) goes out as **anon** (`Bearer <anon key>`).

Under RLS, an anon request matches no rows on `profiles` (policy is `auth.uid() = id OR elevated`), so PostgREST returns `[]` and the app surfaces a misleading **"No profile found for this account."** — even when the row exists and the password was correct.

**Rule:** for any authenticated request that must run before the session is persisted, call `SessionStore.cacheToken(auth.accessToken)` first (restore the previous token on failure). Applies to future flows too — signup, password reset, re-auth.

**Why:** observed as a deterministic login failure; auth succeeded but the immediate profile fetch ran as anon and RLS hid the row.

**Separate, compounding gotcha:** the `handle_new_user` trigger only fires on `auth.users` INSERT and defaults `role='public'`. Accounts created before the trigger was applied have **no** profile row; admins need a one-time SQL backfill/promote in the Supabase SQL Editor (e.g. `insert ... select from auth.users where email=... on conflict (id) do update set role='core_team'`).
