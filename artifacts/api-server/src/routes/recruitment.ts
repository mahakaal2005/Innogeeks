import { Router } from "express";
import { z } from "zod/v4";
import { requireCoreTeam } from "../middleware/auth";
import { generalLimiter } from "../middleware/rateLimiter";
import { supabaseAdmin } from "../lib/supabase";
import { getOpenRecruitmentWindow } from "../lib/recruitmentWindow";

const router = Router();

// Public, no-auth: tells the quiz site whether to show the Round 1 test portal
// or the club info page. "Test live" = an open recruitment window AND at least
// one published quiz for that window's academic year.
router.get("/recruitment/status", generalLimiter, async (req, res) => {
  const { window, error } = await getOpenRecruitmentWindow();
  if (error) {
    req.log.error({ error }, "Failed to fetch recruitment window status");
    res.status(500).json({ error: "Database error" });
    return;
  }
  if (!window) {
    res.json({ testLive: false, academicYear: null });
    return;
  }

  const { count, error: quizErr } = await supabaseAdmin
    .from("quizzes")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true)
    .eq("academic_year", window.academicYear);

  if (quizErr) {
    req.log.error({ quizErr }, "Failed to count published quizzes for status");
    res.status(500).json({ error: "Database error" });
    return;
  }

  res.json({
    testLive: (count ?? 0) > 0,
    academicYear: window.academicYear,
  });
});

const AssignRoleSchema = z.object({
  applicationId: z.uuid(),
});

router.post(
  "/recruitment/assign-role",
  generalLimiter,
  requireCoreTeam,
  async (req, res) => {
    const parsed = AssignRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    const { applicationId } = parsed.data;

    const { error: rpcErr } = await supabaseAdmin.rpc("assign_member_role", {
      p_application_id: applicationId,
      p_reviewer_id: req.user!.id,
    });

    if (rpcErr) {
      req.log.error({ rpcErr, applicationId }, "Role assignment failed");
      const msg = rpcErr.message ?? "";
      if (
        msg.includes("not found") ||
        msg.includes("not cleared") ||
        msg.includes("not in round2")
      ) {
        res.status(409).json({ error: rpcErr.message });
      } else {
        res.status(500).json({ error: "Role assignment failed" });
      }
      return;
    }

    req.log.info(
      { applicationId, reviewerId: req.user!.id },
      "Member role assigned",
    );
    res.json({ success: true });
  },
);

export default router;
