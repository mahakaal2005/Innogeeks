-- ============================================================
-- 007_club_info_history.sql
-- Full audit history of club-info page edits.
-- Apply via Supabase SQL Editor AFTER 003_club_info.sql
-- ============================================================

-- One row per save of the club-info page. Captures who saved it, when, and a
-- snapshot of the content as it was saved — giving the core team accountability
-- and a way to spot or recover from a bad edit. Written by Express
-- (service-role) on every successful PUT /club-info.
CREATE TABLE IF NOT EXISTS public.club_info_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content     jsonb NOT NULL,
  edited_by   uuid REFERENCES public.profiles(id),
  edited_at   timestamptz NOT NULL DEFAULT now()
);

-- Most history reads list recent edits newest-first.
CREATE INDEX IF NOT EXISTS club_info_history_edited_at_idx
  ON public.club_info_history (edited_at DESC);

ALTER TABLE public.club_info_history ENABLE ROW LEVEL SECURITY;

-- Only core_team may read the edit history. Express (service-role) bypasses RLS
-- for both reads and writes; these policies guard any direct client access.
DROP POLICY IF EXISTS "club_info_history: core_team read" ON public.club_info_history;
CREATE POLICY "club_info_history: core_team read"
  ON public.club_info_history FOR SELECT
  USING (public.current_user_role() = 'core_team');

-- Only core_team may insert history rows.
DROP POLICY IF EXISTS "club_info_history: core_team write" ON public.club_info_history;
CREATE POLICY "club_info_history: core_team write"
  ON public.club_info_history FOR INSERT
  WITH CHECK (public.current_user_role() = 'core_team');
