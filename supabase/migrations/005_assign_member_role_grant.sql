-- ============================================================
-- 005_assign_member_role_grant.sql
-- Lock down the assign_member_role SECURITY DEFINER RPC.
-- Apply AFTER 002_rls.sql via the Supabase SQL Editor.
-- ============================================================
--
-- assign_member_role runs as SECURITY DEFINER and atomically promotes a
-- Round2-qualified application to member (mutates recruitment_applications,
-- profiles, and role_change_log). By default PostgREST exposes public-schema
-- functions to the `anon` and `authenticated` roles, which would let a client
-- call this RPC directly with the anon key and bypass the Express server's
-- role/permission checks in artifacts/api-server/src/routes/recruitment.ts.
-- Only the trusted Express server (service-role key) may invoke it.
--
-- NOTE: do NOT revoke the RLS helper functions current_user_role() /
-- current_user_domain() — they must stay executable for RLS policies to work.

REVOKE ALL ON FUNCTION
  public.assign_member_role(uuid, uuid)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
  public.assign_member_role(uuid, uuid)
  TO service_role;
