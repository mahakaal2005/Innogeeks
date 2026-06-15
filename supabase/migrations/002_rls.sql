-- ============================================================
-- 002_rls.sql
-- RLS policies, helper functions, and triggers
-- Apply AFTER 001_schema.sql via Supabase SQL Editor
-- ============================================================

-- ── Helper functions ─────────────────────────────────────────

-- Returns the current user's role (cached per statement)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Returns the current user's domain
CREATE OR REPLACE FUNCTION public.current_user_domain()
RETURNS public.domain
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT domain FROM public.profiles WHERE id = auth.uid();
$$;

-- ── Auto-create profile on signup ────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'public'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Atomic Round2 → member role assignment ───────────────────

CREATE OR REPLACE FUNCTION public.assign_member_role(
  p_application_id uuid,
  p_reviewer_id    uuid
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_app public.recruitment_applications%ROWTYPE;
  v_old_role  public.role;
  v_old_domain public.domain;
BEGIN
  SELECT * INTO v_app
    FROM public.recruitment_applications
   WHERE id = p_application_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found: %', p_application_id;
  END IF;
  IF v_app.round2_status <> 'cleared' THEN
    RAISE EXCEPTION 'Round 2 not cleared for application %', p_application_id;
  END IF;
  IF v_app.status NOT IN ('round2_qualified') THEN
    RAISE EXCEPTION 'Application % not in round2_qualified status', p_application_id;
  END IF;

  SELECT role, domain INTO v_old_role, v_old_domain
    FROM public.profiles WHERE id = v_app.user_id;

  UPDATE public.recruitment_applications
     SET status     = 'selected',
         reviewed_by = p_reviewer_id,
         updated_at  = now()
   WHERE id = p_application_id;

  UPDATE public.profiles
     SET role       = 'member',
         domain     = v_app.domain,
         updated_at = now()
   WHERE id = v_app.user_id;

  INSERT INTO public.role_change_log
    (changed_by, target_user, old_role, new_role, old_domain, new_domain, reason)
  VALUES
    (p_reviewer_id, v_app.user_id,
     v_old_role::text, 'member',
     v_old_domain::text, v_app.domain::text,
     'Round2 selection');
END;
$$;

-- ── Enable RLS ───────────────────────────────────────────────

ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_change_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_windows    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_folders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations    ENABLE ROW LEVEL SECURITY;

-- ── profiles ─────────────────────────────────────────────────

-- Users see their own profile; coordinators/core_team see all
CREATE POLICY "profiles: own row or elevated"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.current_user_role() IN ('coordinator', 'core_team')
  );

-- Users update their own profile (name, year); role/domain only via functions
CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- core_team can update any profile (role promotions etc.)
CREATE POLICY "profiles: core_team update any"
  ON public.profiles FOR UPDATE
  USING (public.current_user_role() = 'core_team');

-- INSERT handled by trigger (SECURITY DEFINER), no policy needed for anon
CREATE POLICY "profiles: insert via trigger only"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── role_change_log ──────────────────────────────────────────

CREATE POLICY "role_change_log: core_team select"
  ON public.role_change_log FOR SELECT
  USING (public.current_user_role() = 'core_team');

-- ── recruitment_windows ──────────────────────────────────────

CREATE POLICY "recruitment_windows: authenticated select"
  ON public.recruitment_windows FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "recruitment_windows: core_team write"
  ON public.recruitment_windows FOR ALL
  USING (public.current_user_role() = 'core_team');

-- ── recruitment_applications ─────────────────────────────────

CREATE POLICY "recruitment_apps: own row"
  ON public.recruitment_applications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "recruitment_apps: coordinator sees domain"
  ON public.recruitment_applications FOR SELECT
  USING (
    public.current_user_role() = 'coordinator'
    AND domain = public.current_user_domain()
  );

CREATE POLICY "recruitment_apps: core_team sees all"
  ON public.recruitment_applications FOR SELECT
  USING (public.current_user_role() = 'core_team');

CREATE POLICY "recruitment_apps: insert own"
  ON public.recruitment_applications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "recruitment_apps: coordinator update domain"
  ON public.recruitment_applications FOR UPDATE
  USING (
    public.current_user_role() = 'coordinator'
    AND domain = public.current_user_domain()
  );

CREATE POLICY "recruitment_apps: core_team update all"
  ON public.recruitment_applications FOR UPDATE
  USING (public.current_user_role() = 'core_team');

-- ── quizzes ──────────────────────────────────────────────────

CREATE POLICY "quizzes: published select for authenticated"
  ON public.quizzes FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "quizzes: coordinator/core_team see all"
  ON public.quizzes FOR SELECT
  USING (public.current_user_role() IN ('coordinator', 'core_team'));

CREATE POLICY "quizzes: core_team write"
  ON public.quizzes FOR ALL
  USING (public.current_user_role() = 'core_team');

-- ── quiz_questions ───────────────────────────────────────────
-- Answers (correct_option_index) hidden from non-admins via app logic;
-- service-role (Express) always bypasses RLS.

CREATE POLICY "quiz_questions: select if quiz published"
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
       WHERE q.id = quiz_id
         AND (q.is_published = true OR public.current_user_role() IN ('coordinator', 'core_team'))
    )
  );

CREATE POLICY "quiz_questions: core_team write"
  ON public.quiz_questions FOR ALL
  USING (public.current_user_role() = 'core_team');

-- ── quiz_submissions ─────────────────────────────────────────
-- Inserts come from Express (service-role, bypasses RLS)

CREATE POLICY "quiz_submissions: own submission"
  ON public.quiz_submissions FOR SELECT
  USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "quiz_submissions: coordinator/core_team see all"
  ON public.quiz_submissions FOR SELECT
  USING (public.current_user_role() IN ('coordinator', 'core_team'));

-- ── attendance_sessions ──────────────────────────────────────

CREATE POLICY "attendance_sessions: domain member/coord select"
  ON public.attendance_sessions FOR SELECT
  USING (
    domain = public.current_user_domain()
    AND public.current_user_role() IN ('member', 'coordinator', 'core_team')
  );

CREATE POLICY "attendance_sessions: coordinator/core_team write"
  ON public.attendance_sessions FOR ALL
  USING (
    public.current_user_role() = 'core_team'
    OR (
      public.current_user_role() = 'coordinator'
      AND domain = public.current_user_domain()
    )
  );

-- ── attendance_records ───────────────────────────────────────

CREATE POLICY "attendance_records: coordinator/core_team"
  ON public.attendance_records FOR ALL
  USING (public.current_user_role() IN ('coordinator', 'core_team'));

-- Members can see their own records
CREATE POLICY "attendance_records: own record"
  ON public.attendance_records FOR SELECT
  USING (user_id = auth.uid());

-- ── resource_folders ─────────────────────────────────────────

CREATE POLICY "resource_folders: member of domain select"
  ON public.resource_folders FOR SELECT
  USING (
    domain = public.current_user_domain()
    OR public.current_user_role() IN ('coordinator', 'core_team')
  );

CREATE POLICY "resource_folders: coordinator/core_team write"
  ON public.resource_folders FOR ALL
  USING (
    public.current_user_role() = 'core_team'
    OR (
      public.current_user_role() = 'coordinator'
      AND domain = public.current_user_domain()
    )
  );

-- ── resources ────────────────────────────────────────────────

CREATE POLICY "resources: member of domain select"
  ON public.resources FOR SELECT
  USING (
    domain = public.current_user_domain()
    OR public.current_user_role() IN ('coordinator', 'core_team')
  );

CREATE POLICY "resources: coordinator/core_team write"
  ON public.resources FOR ALL
  USING (
    public.current_user_role() = 'core_team'
    OR (
      public.current_user_role() = 'coordinator'
      AND domain = public.current_user_domain()
    )
  );

-- ── events ───────────────────────────────────────────────────

CREATE POLICY "events: published open events for all authenticated"
  ON public.events FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND status = 'published'
    AND registration_scope = 'open'
  );

CREATE POLICY "events: members_only events for members+"
  ON public.events FOR SELECT
  USING (
    status = 'published'
    AND registration_scope = 'members_only'
    AND public.current_user_role() IN ('member', 'coordinator', 'core_team')
  );

CREATE POLICY "events: coordinator/core_team see all"
  ON public.events FOR SELECT
  USING (public.current_user_role() IN ('coordinator', 'core_team'));

CREATE POLICY "events: coordinator/core_team write"
  ON public.events FOR ALL
  USING (public.current_user_role() IN ('coordinator', 'core_team'));

-- ── event_registrations ──────────────────────────────────────

CREATE POLICY "event_registrations: own"
  ON public.event_registrations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "event_registrations: coordinator/core_team see all"
  ON public.event_registrations FOR SELECT
  USING (public.current_user_role() IN ('coordinator', 'core_team'));

CREATE POLICY "event_registrations: insert own"
  ON public.event_registrations FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.events e
       WHERE e.id = event_id
         AND e.status = 'published'
         AND (
           e.registration_scope = 'open'
           OR public.current_user_role() IN ('member', 'coordinator', 'core_team')
         )
    )
  );

CREATE POLICY "event_registrations: coordinator/core_team update"
  ON public.event_registrations FOR UPDATE
  USING (public.current_user_role() IN ('coordinator', 'core_team'));
