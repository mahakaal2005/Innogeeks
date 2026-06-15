-- ============================================================
-- 006_security_definer_audit.sql
-- Audit record + intended-caller documentation for every
-- SECURITY DEFINER function in the public schema.
-- Apply AFTER 002_rls.sql, 003_quiz_rpc.sql, 004_rpc_grants.sql,
-- and 005_assign_member_role_grant.sql via the Supabase SQL Editor.
-- ============================================================
--
-- Why this file exists
-- --------------------
-- SECURITY DEFINER functions run with the privileges of their owner and
-- bypass RLS, so any one of them that is EXECUTE-able by `anon` or
-- `authenticated` is a potential way to skip the Express server's checks.
-- By default PostgREST exposes every public-schema function to those two
-- roles. This migration is the single source of truth for which functions
-- are intentionally callable by clients and which are locked to the trusted
-- Express server (service_role). It re-asserts the locks idempotently and
-- attaches a COMMENT to each function documenting its intended caller.
--
-- Complete audit (5 SECURITY DEFINER functions, all in schema `public`)
-- --------------------------------------------------------------------
--   1. current_user_role()          read-only   PUBLIC  — used inside RLS
--                                                          policies; must stay
--                                                          executable by anon
--                                                          + authenticated.
--   2. current_user_domain()        read-only   PUBLIC  — same as above.
--   3. handle_new_user()            mutating    TRIGGER — fires only from the
--                                                          on_auth_user_created
--                                                          trigger on auth.users.
--                                                          Returns `trigger`, so
--                                                          PostgREST never exposes
--                                                          it and it cannot be
--                                                          invoked directly as an
--                                                          RPC. No grant needed.
--   4. submit_quiz(...)             mutating    SERVER  — locked down in 004.
--   5. assign_member_role(...)      mutating    SERVER  — locked down in 005.
--
-- Result: no data-mutating SECURITY DEFINER function is reachable by anon or
-- authenticated. The two server-only RPCs are revoked from PUBLIC/anon/
-- authenticated and granted only to service_role; the read-only RLS helpers
-- and the trigger function remain as intended.

-- ── Re-assert server-only locks (idempotent; mirrors 004 / 005) ──────────

REVOKE ALL ON FUNCTION
  public.submit_quiz(uuid, text, uuid, jsonb, integer, integer, boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION
  public.submit_quiz(uuid, text, uuid, jsonb, integer, integer, boolean)
  TO service_role;

REVOKE ALL ON FUNCTION
  public.assign_member_role(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION
  public.assign_member_role(uuid, uuid)
  TO service_role;

-- ── Document intended caller on every SECURITY DEFINER function ──────────

COMMENT ON FUNCTION public.current_user_role() IS
  'SECURITY DEFINER, read-only. PUBLIC: used inside RLS policies; must remain executable by anon + authenticated.';

COMMENT ON FUNCTION public.current_user_domain() IS
  'SECURITY DEFINER, read-only. PUBLIC: used inside RLS policies; must remain executable by anon + authenticated.';

COMMENT ON FUNCTION public.handle_new_user() IS
  'SECURITY DEFINER trigger function for on_auth_user_created on auth.users. Trigger-only; returns trigger, not exposed as an RPC.';

COMMENT ON FUNCTION public.submit_quiz(uuid, text, uuid, jsonb, integer, integer, boolean) IS
  'SECURITY DEFINER, data-mutating. SERVER-ONLY: revoked from anon/authenticated, granted to service_role only (see 004). Call via the Express server.';

COMMENT ON FUNCTION public.assign_member_role(uuid, uuid) IS
  'SECURITY DEFINER, data-mutating. SERVER-ONLY: revoked from anon/authenticated, granted to service_role only (see 005). Call via the Express server.';
