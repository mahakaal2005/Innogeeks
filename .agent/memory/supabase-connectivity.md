---
name: Supabase connectivity from Replit
description: Why the direct DB host fails and which pooler host/user format to use
---

# Connecting to Supabase Postgres from Replit

The **direct** DB host `db.<project-ref>.supabase.co` is **IPv6-only** → unreachable from the Replit container. Do not use it.

Use the **Supavisor session pooler** instead:
- Host: `aws-0-<region>.pooler.supabase.com` (region discovered by probing; this project is `ap-south-1`).
- Port: `5432` (session pooler).
- User must be `postgres.<project-ref>` (NOT plain `postgres`).
- SSL required with `rejectUnauthorized: false`.

**Why:** Replit has no IPv6 egress; the pooler is dual-stack. The pooler also requires the tenant-qualified username form.

**How to apply:** Build the pg Pool from **discrete fields** (host/port/user/password/database) rather than a URL — the DB password contains special characters that break URL parsing/encoding. The `SUPABASE_DB_URL` secret holds the wrong (direct) host + raw password and must NOT be used directly. Non-secret discrete fields are stored as env vars `SUPABASE_DB_HOST/PORT/USER/NAME`; password is the `SUPABASE_DB_PASSWORD` secret.

**RLS note:** Drizzle does not manage RLS. Push tables with `drizzle-kit push`, then apply RLS policies, the `profiles.id → auth.users(id)` FK, and the profile-creation trigger as raw SQL via psql.
