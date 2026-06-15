import { Router } from "express";
import { z } from "zod/v4";
import { requireCoreTeam } from "../middleware/auth";
import { generalLimiter } from "../middleware/rateLimiter";
import { supabaseAdmin } from "../lib/supabase";

const router = Router();

const VALID_ROLES = ["public", "member", "coordinator", "core_team"] as const;
const VALID_DOMAINS = ["android", "web", "ml", "iot", "arvr"] as const;

const SetRoleSchema = z.object({
  userId: z.uuid(),
  role: z.enum(VALID_ROLES),
  domain: z.enum(VALID_DOMAINS).nullable().optional(),
  reason: z.string().max(500).optional(),
});

router.post(
  "/admin/set-role",
  generalLimiter,
  requireCoreTeam,
  async (req, res) => {
    const parsed = SetRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    const { userId, role, domain, reason } = parsed.data;

    const { data: target } = await supabaseAdmin
      .from("profiles")
      .select("id, role, domain, email")
      .eq("id", userId)
      .maybeSingle();

    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (target.id === req.user!.id) {
      res.status(400).json({ error: "Cannot change your own role" });
      return;
    }

    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .update({
        role,
        domain: domain !== undefined ? domain : target.domain,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileErr) {
      req.log.error({ profileErr }, "Failed to update profile role");
      res.status(500).json({ error: "Database error" });
      return;
    }

    await supabaseAdmin.from("role_change_log").insert({
      changed_by: req.user!.id,
      target_user: userId,
      old_role: target.role,
      new_role: role,
      old_domain: target.domain,
      new_domain: domain !== undefined ? domain : target.domain,
      reason: reason ?? "Manual admin assignment",
    });

    req.log.info(
      { targetUser: userId, oldRole: target.role, newRole: role, by: req.user!.id },
      "Role changed",
    );
    res.json({ success: true, userId, role, domain });
  },
);

export default router;
