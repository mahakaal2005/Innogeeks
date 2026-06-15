import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { registrationScopeEnum, eventStatusEnum } from "./enums";

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
    venue: text("venue"),
    bannerUrl: text("banner_url"),
    registrationScope: registrationScopeEnum("registration_scope")
      .notNull()
      .default("open"),
    status: eventStatusEnum("status").notNull().default("draft"),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("events_status_idx").on(table.status)],
);

export const eventRegistrations = pgTable(
  "event_registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id),
    attended: boolean("attended").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("event_registrations_event_user_uq").on(
      table.eventId,
      table.userId,
    ),
    index("event_registrations_event_idx").on(table.eventId),
  ],
);

export type Event = typeof events.$inferSelect;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
