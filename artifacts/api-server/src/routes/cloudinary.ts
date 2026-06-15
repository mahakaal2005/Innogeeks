import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod/v4";
import { requireAuth } from "../middleware/auth";
import { generalLimiter } from "../middleware/rateLimiter";

const router = Router();

const SignSchema = z.object({
  folder: z.string().min(1).max(128),
  publicId: z.string().optional(),
  eager: z.string().optional(),
});

router.post(
  "/cloudinary/sign",
  generalLimiter,
  requireAuth,
  async (req, res) => {
    const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;

    if (!cloudinarySecret || !cloudName || !apiKey) {
      res.status(503).json({ error: "Cloudinary not configured" });
      return;
    }

    const parsed = SignSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    const { folder, publicId, eager } = parsed.data;

    const timestamp = Math.floor(Date.now() / 1000);

    const params: Record<string, string | number> = {
      folder,
      timestamp,
    };
    if (publicId) params["public_id"] = publicId;
    if (eager) params["eager"] = eager;

    const sortedParamStr = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&");

    const signature = crypto
      .createHash("sha256")
      .update(sortedParamStr + cloudinarySecret)
      .digest("hex");

    res.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  },
);

export default router;
