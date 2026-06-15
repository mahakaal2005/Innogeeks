-- ============================================================
-- 003_quiz_rpc.sql
-- RPC for atomic quiz submission
-- Apply AFTER 001_schema.sql and 002_rls.sql
-- ============================================================

CREATE OR REPLACE FUNCTION public.submit_quiz(
  p_quiz_id uuid,
  p_email text,
  p_application_id uuid,
  p_answers jsonb,
  p_score integer,
  p_total integer,
  p_passed boolean
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  -- 1. Insert the quiz submission
  INSERT INTO public.quiz_submissions (quiz_id, email, application_id, answers, score, total, passed)
  VALUES (p_quiz_id, p_email, p_application_id, p_answers, p_score, p_total, p_passed);

  -- 2. Update the application status atomically
  IF p_application_id IS NOT NULL THEN
    UPDATE public.recruitment_applications
       SET round1_status = CASE WHEN p_passed THEN 'cleared'::public.round_status ELSE 'failed'::public.round_status END,
           status = CASE WHEN p_passed THEN 'round2_qualified'::public.application_status ELSE status END,
           updated_at = now()
     WHERE id = p_application_id;
  END IF;
END;
$$;
