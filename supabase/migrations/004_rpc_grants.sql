-- ============================================================
-- 004_rpc_grants.sql
-- Lock down the submit_quiz SECURITY DEFINER RPC.
-- Apply AFTER 003_quiz_rpc.sql via the Supabase SQL Editor.
-- ============================================================
--
-- submit_quiz runs as SECURITY DEFINER and writes quiz_submissions +
-- mutates recruitment_applications status. By default PostgREST exposes
-- public-schema functions to the `anon` and `authenticated` roles, which
-- would let a client call this RPC directly with the anon key and bypass
-- the Express server's recruitment-window / eligibility checks. Only the
-- trusted Express server (service-role key) may invoke it.

REVOKE ALL ON FUNCTION
  public.submit_quiz(uuid, text, uuid, jsonb, integer, integer, boolean)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
  public.submit_quiz(uuid, text, uuid, jsonb, integer, integer, boolean)
  TO service_role;
