-- ============================================================
-- 001_schema.sql
-- Full public schema: enums + tables + indexes
-- Apply via: Supabase SQL Editor or `supabase db push`
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────

CREATE TYPE public.role AS ENUM (
  'public', 'member', 'coordinator', 'core_team'
);

CREATE TYPE public.domain AS ENUM (
  'android', 'web', 'ml', 'iot', 'arvr'
);

CREATE TYPE public.payment_method AS ENUM ('upi', 'cash');

CREATE TYPE public.payment_status AS ENUM (
  'pending', 'cash_pending', 'approved', 'rejected'
);

CREATE TYPE public.round_status AS ENUM (
  'pending', 'cleared', 'failed'
);

CREATE TYPE public.application_status AS ENUM (
  'registered', 'round1_qualified', 'round2_qualified', 'selected', 'rejected'
);

CREATE TYPE public.resource_type AS ENUM ('pdf', 'link');

CREATE TYPE public.registration_scope AS ENUM (
  'open', 'members_only'
);

CREATE TYPE public.event_status AS ENUM (
  'draft', 'published', 'past'
);

-- ── Tables ───────────────────────────────────────────────────

-- profiles: mirrors auth.users; created automatically by trigger
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text NOT NULL UNIQUE,
  name         text NOT NULL,
  role         public.role NOT NULL DEFAULT 'public',
  domain       public.domain,
  year         integer,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_role_idx   ON public.profiles (role);
CREATE INDEX IF NOT EXISTS profiles_domain_idx ON public.profiles (domain);

-- role_change_log
CREATE TABLE IF NOT EXISTS public.role_change_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_by   uuid REFERENCES public.profiles(id),
  target_user  uuid REFERENCES public.profiles(id),
  old_role     text,
  new_role     text,
  old_domain   text,
  new_domain   text,
  reason       text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- recruitment_windows
CREATE TABLE IF NOT EXISTS public.recruitment_windows (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_open        boolean NOT NULL DEFAULT false,
  opened_by      uuid REFERENCES public.profiles(id),
  opened_at      timestamptz,
  closed_by      uuid REFERENCES public.profiles(id),
  closed_at      timestamptz,
  academic_year  text NOT NULL,
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- recruitment_applications
CREATE TABLE IF NOT EXISTS public.recruitment_applications (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES public.profiles(id),
  email               text NOT NULL,
  roll_number         text NOT NULL,
  name                text NOT NULL,
  domain              public.domain NOT NULL,
  academic_year       text NOT NULL,
  payment_method      public.payment_method,
  payment_status      public.payment_status NOT NULL DEFAULT 'pending',
  razorpay_order_id   text,
  razorpay_payment_id text,
  idempotency_key     text,
  round1_status       public.round_status NOT NULL DEFAULT 'pending',
  round2_status       public.round_status NOT NULL DEFAULT 'pending',
  round2_score        jsonb,
  round2_notes        text,
  reviewed_by         uuid REFERENCES public.profiles(id),
  status              public.application_status NOT NULL DEFAULT 'registered',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS recruitment_applications_user_year_uq
  ON public.recruitment_applications (user_id, academic_year);
CREATE INDEX IF NOT EXISTS recruitment_applications_status_idx
  ON public.recruitment_applications (status);
CREATE INDEX IF NOT EXISTS recruitment_applications_domain_idx
  ON public.recruitment_applications (domain);
CREATE INDEX IF NOT EXISTS recruitment_applications_user_idx
  ON public.recruitment_applications (user_id);

-- quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  description       text,
  domain            public.domain,
  academic_year     text,
  time_limit_seconds integer,
  passing_score     integer NOT NULL DEFAULT 0,
  is_published      boolean NOT NULL DEFAULT false,
  created_by        uuid REFERENCES public.profiles(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- quiz_questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id              uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text        text NOT NULL,
  options              jsonb NOT NULL,
  correct_option_index integer NOT NULL,
  marks                integer NOT NULL DEFAULT 1,
  order_index          integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS quiz_questions_quiz_idx ON public.quiz_questions (quiz_id);

-- quiz_submissions
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id        uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  email          text NOT NULL,
  application_id uuid REFERENCES public.recruitment_applications(id),
  answers        jsonb NOT NULL,
  score          integer NOT NULL,
  total          integer NOT NULL,
  passed         boolean NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS quiz_submissions_quiz_email_uq
  ON public.quiz_submissions (quiz_id, email);
CREATE INDEX IF NOT EXISTS quiz_submissions_quiz_idx
  ON public.quiz_submissions (quiz_id);

-- attendance_sessions
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain       public.domain NOT NULL,
  title        text NOT NULL,
  session_date date NOT NULL,
  created_by   uuid REFERENCES public.profiles(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS attendance_sessions_domain_idx
  ON public.attendance_sessions (domain);

-- attendance_records
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id),
  is_present  boolean NOT NULL DEFAULT false,
  marked_by   uuid REFERENCES public.profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS attendance_records_session_user_uq
  ON public.attendance_records (session_id, user_id);
CREATE INDEX IF NOT EXISTS attendance_records_session_idx
  ON public.attendance_records (session_id);
CREATE INDEX IF NOT EXISTS attendance_records_user_idx
  ON public.attendance_records (user_id);

-- resource_folders
CREATE TABLE IF NOT EXISTS public.resource_folders (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain       public.domain NOT NULL,
  name         text NOT NULL,
  parent_id    uuid REFERENCES public.resource_folders(id) ON DELETE CASCADE,
  order_index  integer NOT NULL DEFAULT 0,
  created_by   uuid REFERENCES public.profiles(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS resource_folders_domain_parent_idx
  ON public.resource_folders (domain, parent_id);

-- resources
CREATE TABLE IF NOT EXISTS public.resources (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id   uuid REFERENCES public.resource_folders(id) ON DELETE CASCADE,
  domain      public.domain NOT NULL,
  title       text NOT NULL,
  type        public.resource_type NOT NULL,
  url         text NOT NULL,
  created_by  uuid REFERENCES public.profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS resources_folder_idx ON public.resources (folder_id);

-- events
CREATE TABLE IF NOT EXISTS public.events (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  description         text,
  event_date          timestamptz NOT NULL,
  venue               text,
  banner_url          text,
  registration_scope  public.registration_scope NOT NULL DEFAULT 'open',
  status              public.event_status NOT NULL DEFAULT 'draft',
  created_by          uuid REFERENCES public.profiles(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_status_idx ON public.events (status);

-- event_registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id),
  attended    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS event_registrations_event_user_uq
  ON public.event_registrations (event_id, user_id);
CREATE INDEX IF NOT EXISTS event_registrations_event_idx
  ON public.event_registrations (event_id);
