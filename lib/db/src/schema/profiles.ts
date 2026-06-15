import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { roleEnum, domainEnum } from "./enums";

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    role: roleEnum("role").notNull().default("public"),
    domain: domainEnum("domain"),
    year: integer("year"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("profiles_domain_idx").on(table.domain), index("profiles_role_idx").on(table.role)],
);

export const roleChangeLog = pgTable("role_change_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  changedBy: uuid("changed_by").references(() => profiles.id),
  targetUser: uuid("target_user").references(() => profiles.id),
  oldRole: text("old_role"),
  newRole: text("new_role"),
  oldDomain: text("old_domain"),
  newDomain: text("new_domain"),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type RoleChangeLog = typeof roleChangeLog.$inferSelect;
