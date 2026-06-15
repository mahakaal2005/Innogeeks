import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { domainEnum, resourceTypeEnum } from "./enums";

export const resourceFolders = pgTable(
  "resource_folders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    domain: domainEnum("domain").notNull(),
    name: text("name").notNull(),
    parentId: uuid("parent_id").references(
      (): AnyPgColumn => resourceFolders.id,
      { onDelete: "cascade" },
    ),
    orderIndex: integer("order_index").notNull().default(0),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("resource_folders_domain_parent_idx").on(table.domain, table.parentId),
  ],
);

export const resources = pgTable(
  "resources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    folderId: uuid("folder_id").references(() => resourceFolders.id, {
      onDelete: "cascade",
    }),
    domain: domainEnum("domain").notNull(),
    title: text("title").notNull(),
    type: resourceTypeEnum("type").notNull(),
    url: text("url").notNull(),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("resources_folder_idx").on(table.folderId)],
);

export type ResourceFolder = typeof resourceFolders.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;
