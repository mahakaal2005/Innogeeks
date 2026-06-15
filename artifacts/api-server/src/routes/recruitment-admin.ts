import { Router } from "express";
import { z } from "zod/v4";
import { requireCoreTeam, requireCoordinator } from "../middleware/auth";
import { generalLimiter } from "../middleware/rateLimiter";
import { supabaseAdmin } from "../lib/supabase";

const router = Router();

const WindowSchema = z.object({
  action: z.enum(["open", "close"]),
  academicYear: z.string().min(1).max(20),
});

router.post(
  "/recruitment/window",
  generalLimiter,
  requireCoreTeam,
  async (req, res) => {
    const parsed = WindowSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    const { action, academicYear } = parsed.data;
    const isOpen = action === "open";

    const now = new Date().toISOString();
    const payload: Record<string, unknown> = {
      is_open: isOpen,
      academic_year: academicYear,
      updated_at: now,
    };

    if (isOpen) {
      payload["opened_by"] = req.user!.id;
      payload["opened_at"] = now;
    } else {
      payload["closed_by"] = req.user!.id;
      payload["closed_at"] = now;
    }

    const { data: existing } = await supabaseAdmin
      .from("recruitment_windows")
      .select("id")
      .eq("academic_year", academicYear)
      .maybeSingle();

    let dbErr;
    if (existing) {
      ({ error: dbErr } = await supabaseAdmin
        .from("recruitment_windows")
        .update(payload)
        .eq("id", existing.id));
    } else {
      ({ error: dbErr } = await supabaseAdmin
        .from("recruitment_windows")
        .insert(payload));
    }

    if (dbErr) {
      req.log.error({ dbErr }, "Failed to update recruitment window");
      res.status(500).json({ error: "Database error" });
      return;
    }

    req.log.info(
      { action, academicYear, by: req.user!.id },
      "Recruitment window updated",
    );
    res.json({ success: true, isOpen });
  },
);

const ApproveCashSchema = z.object({
  applicationId: z.uuid(),
});

router.post(
  "/recruitment/approve-cash",
  generalLimiter,
  requireCoordinator,
  async (req, res) => {
    const parsed = ApproveCashSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    const { applicationId } = parsed.data;

    const { data: app } = await supabaseAdmin
      .from("recruitment_applications")
      .select("id, payment_method, payment_status, domain, status")
      .eq("id", applicationId)
      .maybeSingle();

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    if (app.payment_method !== "cash") {
      res.status(400).json({ error: "Not a cash payment application" });
      return;
    }
    if (!["pending", "cash_pending"].includes(app.payment_status)) {
      res.status(409).json({
        error: `Cannot approve — payment_status is already '${app.payment_status}'`,
      });
      return;
    }

    const userRole = req.user!.role;
    const userDomain = req.user!.domain;
    if (
      userRole === "coordinator" &&
      userDomain !== app.domain
    ) {
      res.status(403).json({
        error: "Coordinators can only approve cash for their own domain",
      });
      return;
    }

    const { error: updateErr } = await supabaseAdmin
      .from("recruitment_applications")
      .update({
        payment_status: "approved",
        payment_method: "cash",
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateErr) {
      req.log.error({ updateErr }, "Cash approval DB update failed");
      res.status(500).json({ error: "Database error" });
      return;
    }

    req.log.info(
      { applicationId, approvedBy: req.user!.id },
      "Cash payment approved",
    );
    res.json({ success: true });
  },
);

const ReviewRound2Schema = z.object({
  applicationId: z.uuid(),
  outcome: z.enum(["cleared", "failed"]),
  score: z.record(z.string(), z.number()).optional(),
  notes: z.string().max(2000).optional(),
});

router.post(
  "/recruitment/review-round2",
  generalLimiter,
  requireCoordinator,
  async (req, res) => {
    const parsed = ReviewRound2Schema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    const { applicationId, outcome, score, notes } = parsed.data;

    const { data: app } = await supabaseAdmin
      .from("recruitment_applications")
      .select("id, domain, status, round1_status")
      .eq("id", applicationId)
      .maybeSingle();

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    if (app.round1_status !== "cleared") {
      res.status(409).json({ error: "Applicant has not cleared Round 1" });
      return;
    }

    const userRole = req.user!.role;
    const userDomain = req.user!.domain;
    if (userRole === "coordinator" && userDomain !== app.domain) {
      res.status(403).json({
        error: "Coordinators can only review their own domain",
      });
      return;
    }

    const newStatus =
      outcome === "cleared" ? "round2_qualified" : "rejected";

    const { error: updateErr } = await supabaseAdmin
      .from("recruitment_applications")
      .update({
        round2_status: outcome,
        round2_score: score ?? null,
        round2_notes: notes ?? null,
        reviewed_by: req.user!.id,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateErr) {
      req.log.error({ updateErr }, "Round 2 review update failed");
      res.status(500).json({ error: "Database error" });
      return;
    }

    req.log.info(
      { applicationId, outcome, reviewedBy: req.user!.id },
      "Round 2 review recorded",
    );
    res.json({ success: true, newStatus });
  },
);

export default router;
