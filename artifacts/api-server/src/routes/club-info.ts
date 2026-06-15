import { Router } from "express";
import { z } from "zod/v4";
import type { ClubInfoContent } from "@workspace/db";
import { requireCoreTeam } from "../middleware/auth";
import { generalLimiter } from "../middleware/rateLimiter";
import { supabaseAdmin } from "../lib/supabase";

const router = Router();

const SINGLETON_ID = "main";

const HeroSchema = z.object({
  badge: z.string().max(120),
  titleLead: z.string().max(120),
  titleHighlight: z.string().max(120),
  description: z.string().max(2000),
  imageUrl: z.string().url().max(2048).nullable(),
});

const AboutSchema = z.object({
  heading: z.string().max(160),
  paragraphs: z.array(z.string().max(4000)).max(10),
});

const DomainSchema = z.object({
  key: z.string().max(40),
  label: z.string().max(120),
  blurb: z.string().max(1000),
});

const GalleryItemSchema = z.object({
  url: z.string().url().max(2048),
  caption: z.string().max(200),
});

const SocialSchema = z.object({
  label: z.string().max(60),
  value: z.string().max(200),
  href: z.string().max(2048),
});

const ContentSchema = z.object({
  hero: HeroSchema,
  about: AboutSchema,
  domains: z.array(DomainSchema).max(12),
  gallery: z.array(GalleryItemSchema).max(24),
  socials: z.array(SocialSchema).max(12),
});

router.get("/club-info", generalLimiter, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("club_info")
    .select("content")
    .eq("id", SINGLETON_ID)
    .maybeSingle();

  if (error) {
    req.log.error({ error }, "Failed to fetch club info");
    res.status(500).json({ error: "Database error" });
    return;
  }

  res.json({ content: (data?.content as ClubInfoContent | undefined) ?? null });
});

router.put("/club-info", generalLimiter, requireCoreTeam, async (req, res) => {
  const parsed = ContentSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }
  const content = parsed.data;

  const { data, error } = await supabaseAdmin
    .from("club_info")
    .upsert(
      {
        id: SINGLETON_ID,
        content,
        updated_by: req.user!.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select("content")
    .maybeSingle();

  if (error) {
    req.log.error({ error }, "Failed to update club info");
    res.status(500).json({ error: "Database error" });
    return;
  }

  req.log.info({ by: req.user!.id }, "Club info updated");
  res.json({ content: (data?.content as ClubInfoContent | undefined) ?? content });
});

export default router;
