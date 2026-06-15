import {
  pgTable,
  text,
  jsonb,
  uuid,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
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

// Append-only audit log: one row per save of the club_info page. Captures who
// saved it, when, and a snapshot of the saved content. Written by Express on
// every successful PUT /club-info; reads are core_team-only.
export const clubInfoHistory = pgTable(
  "club_info_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    content: jsonb("content").$type<ClubInfoContent>().notNull(),
    editedBy: uuid("edited_by").references(() => profiles.id),
    editedAt: timestamp("edited_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("club_info_history_edited_at_idx").on(t.editedAt.desc())],
);

export type ClubInfoHistoryEntry = typeof clubInfoHistory.$inferSelect;
export type InsertClubInfoHistoryEntry = typeof clubInfoHistory.$inferInsert;
