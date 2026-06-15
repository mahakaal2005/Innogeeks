import { pgTable, text, jsonb, uuid, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export interface ClubInfoHero {
  badge: string;
  titleLead: string;
  titleHighlight: string;
  description: string;
  imageUrl: string | null;
}

export interface ClubInfoAbout {
  heading: string;
  paragraphs: string[];
}

export interface ClubInfoDomain {
  key: string;
  label: string;
  blurb: string;
}

export interface ClubInfoGalleryItem {
  url: string;
  caption: string;
}

export interface ClubInfoSocial {
  label: string;
  value: string;
  href: string;
}

export interface ClubInfoContent {
  hero: ClubInfoHero;
  about: ClubInfoAbout;
  domains: ClubInfoDomain[];
  gallery: ClubInfoGalleryItem[];
  socials: ClubInfoSocial[];
}

// Singleton row (id = 'main') holding the editable public club-info page
// content. Reads are public; writes are core_team-only (enforced by RLS and the
// Express route). Stored as a single jsonb blob for flexibility.
export const clubInfo = pgTable("club_info", {
  id: text("id").primaryKey().default("main"),
  content: jsonb("content").$type<ClubInfoContent>().notNull(),
  updatedBy: uuid("updated_by").references(() => profiles.id),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ClubInfo = typeof clubInfo.$inferSelect;
export type InsertClubInfo = typeof clubInfo.$inferInsert;
