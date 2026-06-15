import { Router } from "express";
import { z } from "zod/v4";
import type { ClubInfoContent } from "@workspace/db";
import { requireCoreTeam } from "../middleware/auth";
import { generalLimiter } from "../middleware/rateLimiter";
import { supabaseAdmin } from "../lib/supabase";

const router = Router();

const SINGLETON_ID = "main";

async function resolveEditorName(profileId: string | null): Promise<string | null> {
  if (!profileId) return null;
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("name")
    .eq("id", profileId)
    .maybeSingle();
  return (data?.name as string | undefined) ?? null;
}

async function resolveEditorNames(
  profileIds: string[],
): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  const unique = [...new Set(profileIds)];
  if (unique.length === 0) return names;
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id, name")
    .in("id", unique);
  for (const row of (data ?? []) as { id: string; name: string }[]) {
    names.set(row.id, row.name);
  }
  return names;
}

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
    .select("content, updated_at, updated_by")
    .eq("id", SINGLETON_ID)
    .maybeSingle();

  if (error) {
    req.log.error({ error }, "Failed to fetch club info");
    res.status(500).json({ error: "Database error" });
    return;
  }

  const updatedByName = await resolveEditorName(
    (data?.updated_by as string | null | undefined) ?? null,
  );

  res.json({
    content: (data?.content as ClubInfoContent | undefined) ?? null,
    updatedAt: (data?.updated_at as string | null | undefined) ?? null,
    updatedByName,
  });
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
    .select("content, updated_at, updated_by")
    .maybeSingle();

  if (error) {
    req.log.error({ error }, "Failed to update club info");
    res.status(500).json({ error: "Database error" });
    return;
  }

  const { error: historyError } = await supabaseAdmin
    .from("club_info_history")
    .insert({
      content,
      edited_by: req.user!.id,
    });

  if (historyError) {
    // The save itself succeeded; a failed history write should not fail the
    // request, but it's worth surfacing in logs.
    req.log.error({ error: historyError }, "Failed to record club info history");
  }

  const updatedByName = await resolveEditorName(
    (data?.updated_by as string | null | undefined) ?? req.user!.id,
  );

  req.log.info({ by: req.user!.id }, "Club info updated");
  res.json({
    content: (data?.content as ClubInfoContent | undefined) ?? content,
    updatedAt: (data?.updated_at as string | null | undefined) ?? null,
    updatedByName,
  });
});

const HistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

router.get(
  "/club-info/history",
  generalLimiter,
  requireCoreTeam,
  async (req, res) => {
    const parsed = HistoryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    const { limit } = parsed.data;

    const { data, error } = await supabaseAdmin
      .from("club_info_history")
      .select("id, content, edited_at, edited_by")
      .order("edited_at", { ascending: false })
      .limit(limit);

    if (error) {
      req.log.error({ error }, "Failed to fetch club info history");
      res.status(500).json({ error: "Database error" });
      return;
    }

    const rows = (data ?? []) as {
      id: string;
      content: ClubInfoContent;
      edited_at: string;
      edited_by: string | null;
    }[];

    const names = await resolveEditorNames(
      rows.map((r) => r.edited_by).filter((id): id is string => Boolean(id)),
    );

    res.json({
      entries: rows.map((r) => ({
        id: r.id,
        content: r.content,
        editedAt: r.edited_at,
        editedByName: r.edited_by ? names.get(r.edited_by) ?? null : null,
      })),
    });
  },
);

export default router;
