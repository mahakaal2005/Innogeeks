-- ============================================================
-- 003_club_info.sql
-- Editable public club-info page content (singleton row).
-- Apply via Supabase SQL Editor AFTER 001_schema.sql / 002_rls.sql
-- ============================================================

-- Singleton table: one row (id = 'main') holding the whole page content as
-- jsonb. Reads are public (the marketing page is open to everyone); writes are
-- core_team-only. Express (service-role) bypasses RLS for both read and write.
CREATE TABLE IF NOT EXISTS public.club_info (
  id          text PRIMARY KEY DEFAULT 'main',
  content     jsonb NOT NULL,
  updated_by  uuid REFERENCES public.profiles(id),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.club_info ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) may read the published club info.
DROP POLICY IF EXISTS "club_info: public read" ON public.club_info;
CREATE POLICY "club_info: public read"
  ON public.club_info FOR SELECT
  USING (true);

-- Only core_team may insert/update/delete content.
DROP POLICY IF EXISTS "club_info: core_team write" ON public.club_info;
CREATE POLICY "club_info: core_team write"
  ON public.club_info FOR ALL
  USING (public.current_user_role() = 'core_team')
  WITH CHECK (public.current_user_role() = 'core_team');
