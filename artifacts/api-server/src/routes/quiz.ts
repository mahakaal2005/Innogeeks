import { Router } from "express";
import { z } from "zod/v4";
import { quizLimiter } from "../middleware/rateLimiter";
import { supabaseAdmin } from "../lib/supabase";

const router = Router();

const KIET_EMAIL_DOMAIN = "@kiet.edu";

const SubmitQuizSchema = z.object({
  email: z.email(),
  applicationId: z.uuid(),
  answers: z.record(z.string(), z.number().int().min(0)),
});

const ValidateEmailSchema = z.object({
  email: z.email(),
});

const QUIZ_FIELDS =
  "id, title, description, domain, academic_year, time_limit_seconds, passing_score";

type QuizForApplicant = {
  id: string;
  title: string;
  description: string | null;
  domain: string;
  academic_year: string;
  time_limit_seconds: number | null;
  passing_score: number;
};

// Resolves the single published quiz an applicant is allowed to take: exact
// domain + academic_year match, falling back to the latest published quiz for
// the domain. Used by BOTH validate-email and submit so a client cannot submit
// against a quiz that isn't the one assigned to their application.
async function findPublishedQuizForApplicant(
  domain: string,
  academicYear: string,
): Promise<{ quiz: QuizForApplicant | null; error: unknown }> {
  const exact = await supabaseAdmin
    .from("quizzes")
    .select(QUIZ_FIELDS)
    .eq("is_published", true)
    .eq("domain", domain)
    .eq("academic_year", academicYear)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (exact.error) return { quiz: null, error: exact.error };
  if (exact.data) return { quiz: exact.data as QuizForApplicant, error: null };

  const fallback = await supabaseAdmin
    .from("quizzes")
    .select(QUIZ_FIELDS)
    .eq("is_published", true)
    .eq("domain", domain)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (fallback.error) return { quiz: null, error: fallback.error };
  return { quiz: (fallback.data as QuizForApplicant) ?? null, error: null };
}

router.post("/quiz/validate-email", quizLimiter, async (req, res) => {
  const parsed = ValidateEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A valid email is required" });
    return;
  }
  const { email } = parsed.data;

  if (!email.endsWith(KIET_EMAIL_DOMAIN)) {
    res.status(400).json({
      error: `Only ${KIET_EMAIL_DOMAIN} emails are allowed`,
    });
    return;
  }

  const { data: app, error: appErr } = await supabaseAdmin
    .from("recruitment_applications")
    .select("id, name, domain, academic_year, payment_status, status, round1_status")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (appErr) {
    req.log.error({ appErr }, "Failed to fetch application for email validation");
    res.status(500).json({ error: "Database error" });
    return;
  }
  if (!app) {
    res.status(404).json({
      error: "No recruitment application found for this email",
    });
    return;
  }
  if (app.payment_status !== "approved") {
    res.status(403).json({
      error:
        "Your payment hasn't been approved yet. Complete payment before taking the quiz.",
    });
    return;
  }

  const { quiz, error: quizErr } = await findPublishedQuizForApplicant(
    app.domain,
    app.academic_year,
  );

  if (quizErr) {
    req.log.error({ quizErr }, "Failed to fetch quiz for email validation");
    res.status(500).json({ error: "Database error" });
    return;
  }

  if (!quiz) {
    res.status(404).json({
      error: "No active quiz is available for your domain yet",
    });
    return;
  }

  const { count, error: countErr } = await supabaseAdmin
    .from("quiz_questions")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", quiz.id);

  if (countErr) {
    req.log.error(
      { countErr },
      "Failed to count quiz questions for email validation",
    );
    res.status(500).json({ error: "Database error" });
    return;
  }

  const questionCount = count ?? 0;

  const base = {
    applicationId: app.id,
    applicantName: app.name,
    quizId: quiz.id,
    quizTitle: quiz.title,
    quizDescription: quiz.description,
    timeLimitSeconds: quiz.time_limit_seconds,
    questionCount,
    passingScore: quiz.passing_score,
  };

  if (app.round1_status !== "pending") {
    const { data: submission, error: submissionErr } = await supabaseAdmin
      .from("quiz_submissions")
      .select("score, total, passed")
      .eq("quiz_id", quiz.id)
      .eq("email", email)
      .maybeSingle();

    if (submissionErr) {
      req.log.error(
        { submissionErr },
        "Failed to fetch existing submission for email validation",
      );
    }

    res.json({
      ...base,
      canTake: false,
      alreadySubmitted: true,
      result: submission
        ? {
            score: submission.score,
            total: submission.total,
            passed: submission.passed,
          }
        : null,
    });
    return;
  }

  if (app.status !== "round1_qualified") {
    res.status(403).json({
      error:
        "You haven't been shortlisted for Round 1 yet. Please wait for confirmation from a coordinator.",
    });
    return;
  }

  if (questionCount === 0) {
    res.status(404).json({
      error:
        "The quiz for your domain isn't ready yet. Please contact a coordinator.",
    });
    return;
  }

  res.json({
    ...base,
    canTake: true,
    alreadySubmitted: false,
    result: null,
  });
});

router.get("/quiz/:quizId", async (req, res) => {
  const { quizId } = req.params;

  const { data: quiz, error: quizErr } = await supabaseAdmin
    .from("quizzes")
    .select(
      "id, title, description, domain, academic_year, time_limit_seconds, passing_score",
    )
    .eq("id", quizId)
    .eq("is_published", true)
    .maybeSingle();

  if (quizErr) {
    req.log.error({ quizErr }, "Failed to fetch quiz");
    res.status(500).json({ error: "Database error" });
    return;
  }
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found or not published" });
    return;
  }

  const { data: questions, error: qErr } = await supabaseAdmin
    .from("quiz_questions")
    .select("id, question_text, options, marks, order_index")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: true });

  if (qErr) {
    req.log.error({ qErr }, "Failed to fetch questions");
    res.status(500).json({ error: "Database error" });
    return;
  }

  res.json({ quiz, questions: questions ?? [] });
});

router.post("/quiz/:quizId/submit", quizLimiter, async (req, res) => {
  const { quizId } = req.params;

  const parsed = SubmitQuizSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }
  const { email, applicationId, answers } = parsed.data;

  if (!email.endsWith(KIET_EMAIL_DOMAIN)) {
    res.status(400).json({
      error: `Only ${KIET_EMAIL_DOMAIN} emails may submit quizzes`,
    });
    return;
  }

  const { data: app, error: appErr } = await supabaseAdmin
    .from("recruitment_applications")
    .select(
      "id, email, domain, academic_year, payment_status, status, round1_status",
    )
    .eq("id", applicationId)
    .maybeSingle();

  if (appErr) {
    req.log.error({ appErr }, "Failed to fetch application for submission");
    res.status(500).json({ error: "Database error" });
    return;
  }
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  if (app.email !== email) {
    res.status(400).json({ error: "Email does not match application" });
    return;
  }
  if (app.payment_status !== "approved") {
    res
      .status(403)
      .json({ error: "Payment not approved — cannot take quiz yet" });
    return;
  }
  if (app.status !== "round1_qualified") {
    res
      .status(403)
      .json({ error: "You aren't eligible to take Round 1 yet" });
    return;
  }
  if (app.round1_status !== "pending") {
    res.status(409).json({ error: "Round 1 already attempted" });
    return;
  }

  const { quiz: assignedQuiz, error: assignedQuizErr } =
    await findPublishedQuizForApplicant(app.domain, app.academic_year);

  if (assignedQuizErr) {
    req.log.error(
      { assignedQuizErr },
      "Failed to resolve assigned quiz for submission",
    );
    res.status(500).json({ error: "Database error" });
    return;
  }
  if (!assignedQuiz) {
    res
      .status(404)
      .json({ error: "No active quiz is available for your domain" });
    return;
  }
  if (assignedQuiz.id !== quizId) {
    res.status(403).json({
      error: "This quiz is not the one assigned to your application",
    });
    return;
  }

  const { data: questions, error: qErr } = await supabaseAdmin
    .from("quiz_questions")
    .select("id, correct_option_index, marks")
    .eq("quiz_id", quizId);

  if (qErr || !questions || questions.length === 0) {
    req.log.error({ qErr }, "Failed to fetch questions for scoring");
    res.status(500).json({ error: "Could not load quiz questions" });
    return;
  }

  let score = 0;
  let total = 0;
  for (const q of questions) {
    total += q.marks;
    if (answers[q.id] === q.correct_option_index) {
      score += q.marks;
    }
  }

  const passed = score >= assignedQuiz.passing_score;

  const { error: subErr } = await supabaseAdmin
    .from("quiz_submissions")
    .insert({
      quiz_id: quizId,
      email,
      application_id: applicationId,
      answers,
      score,
      total,
      passed,
    });

  if (subErr) {
    if (subErr.code === "23505") {
      res
        .status(409)
        .json({ error: "Quiz already submitted for this email" });
      return;
    }
    req.log.error({ subErr }, "Failed to save submission");
    res.status(500).json({ error: "Failed to save submission" });
    return;
  }

  const update: Record<string, string> = {
    round1_status: passed ? "cleared" : "failed",
    updated_at: new Date().toISOString(),
  };
  if (passed) update["status"] = "round2_qualified";

  const { error: updateErr } = await supabaseAdmin
    .from("recruitment_applications")
    .update(update)
    .eq("id", applicationId)
    .eq("email", email);

  if (updateErr) {
    req.log.error(
      { updateErr, applicationId },
      "Quiz scored but application status update failed",
    );
  }

  req.log.info({ quizId, email, score, total, passed }, "Quiz scored");
  res.status(201).json({ score, total, passed });
});

export default router;
