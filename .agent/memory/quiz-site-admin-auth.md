---
name: Quiz-site admin auth + public config
description: How the no-login quiz-site gains a core_team-only admin surface and gets the Supabase anon key into the browser.
---

# Quiz-site admin auth & public config

The quiz-site is deliberately no-login for the Round 1 quiz flow, and has **no
build-time VITE_ Supabase env vars**. To add a core_team-only admin surface
(e.g. editing club-info content), auth is layered in without disturbing the
public flow:

- The browser cannot get the Supabase URL/anon key from build env (none exist),
  and the agent cannot read secret values. So the Express API exposes a public
  `GET /api/public-config` returning `{ supabaseUrl, supabaseAnonKey }` from its
  server-side `SUPABASE_URL` / `SUPABASE_ANON_KEY`. The anon key is public-safe
  (RLS protects data); this also means it works in prod with zero extra config.
- The frontend builds a Supabase client lazily from that config, does
  email+password login, and feeds the session JWT into the generated API client
  via `setAuthTokenGetter` (from `@workspace/api-client-react`). The getter
  returns null when no session, so the public quiz flow is unaffected.

**Why:** keeps the contract-first/codegen flow intact and avoids needing the
user to set VITE_ secrets we can't read.

**How to apply:** reuse `src/lib/admin-auth.tsx` (AdminAuthProvider + token
getter wiring) for any future authenticated surface in the quiz-site; gate
write endpoints with `requireCoreTeam`/`requireRole` server-side regardless.
