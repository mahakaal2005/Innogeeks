import { Router } from "express";
import { z } from "zod/v4";
import { quizLimiter } from "../middleware/rateLimiter";
import { supabaseAdmin } from "../lib/supabase";

const router = Router();

const KIET_EMAIL_DOMAIN = "@kiet.edu";

const SubmitQuizSchema = z.object({
  email: z.email(),
  applicationId: z.uuid().optional(),
  answers: z.record(z.string(), z.number().int().min(0)),
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

  if (applicationId) {
    const { data: app } = await supabaseAdmin
      .from("recruitment_applications")
      .select("id, email, payment_status, round1_status")
      .eq("id", applicationId)
      .maybeSingle();

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
    if (app.round1_status !== "pending") {
      res.status(409).json({ error: "Round 1 already attempted" });
      return;
    }
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

  const { data: quizMeta } = await supabaseAdmin
    .from("quizzes")
    .select("passing_score")
    .eq("id", quizId)
    .maybeSingle();

  const passed = score >= (quizMeta?.passing_score ?? 0);

  const { error: subErr } = await supabaseAdmin
    .from("quiz_submissions")
    .insert({
      quiz_id: quizId,
      email,
      application_id: applicationId ?? null,
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

  if (applicationId) {
    const newRound1Status = passed ? "cleared" : "failed";
    const newStatus = passed ? "round1_qualified" : undefined;

    const update: Record<string, string> = {
      round1_status: newRound1Status,
      updated_at: new Date().toISOString(),
    };
    if (newStatus) update["status"] = newStatus;

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
  }

  req.log.info({ quizId, email, score, total, passed }, "Quiz scored");
  res.status(201).json({ score, total, passed });
});

export default router;
