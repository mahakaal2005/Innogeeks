import {
  pgTable,
  uuid,
  text,
  boolean,
  date,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { domainEnum } from "./enums";

export const attendanceSessions = pgTable(
  "attendance_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    domain: domainEnum("domain").notNull(),
    title: text("title").notNull(),
    sessionDate: date("session_date").notNull(),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("attendance_sessions_domain_idx").on(table.domain)],
);

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => attendanceSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id),
    isPresent: boolean("is_present").notNull().default(false),
    markedBy: uuid("marked_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("attendance_records_session_user_uq").on(
      table.sessionId,
      table.userId,
    ),
    index("attendance_records_session_idx").on(table.sessionId),
    index("attendance_records_user_idx").on(table.userId),
  ],
);

export type AttendanceSession = typeof attendanceSessions.$inferSelect;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = typeof attendanceRecords.$inferInsert;
