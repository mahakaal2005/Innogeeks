import { Router } from "express";
import { z } from "zod/v4";
import { requireCoreTeam } from "../middleware/auth";
import { generalLimiter } from "../middleware/rateLimiter";
import { supabaseAdmin } from "../lib/supabase";

const router = Router();

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
