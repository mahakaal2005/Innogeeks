import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import {
  domainEnum,
  paymentMethodEnum,
  paymentStatusEnum,
  roundStatusEnum,
  applicationStatusEnum,
} from "./enums";

export const recruitmentWindows = pgTable("recruitment_windows", {
  id: uuid("id").primaryKey().defaultRandom(),
  isOpen: boolean("is_open").notNull().default(false),
  openedBy: uuid("opened_by").references(() => profiles.id),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  closedBy: uuid("closed_by").references(() => profiles.id),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  academicYear: text("academic_year").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const recruitmentApplications = pgTable(
  "recruitment_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => profiles.id),
    email: text("email").notNull(),
    rollNumber: text("roll_number").notNull(),
    name: text("name").notNull(),
    domain: domainEnum("domain").notNull(),
    academicYear: text("academic_year").notNull(),
    paymentMethod: paymentMethodEnum("payment_method"),
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("pending"),
    razorpayOrderId: text("razorpay_order_id"),
    razorpayPaymentId: text("razorpay_payment_id"),
    idempotencyKey: text("idempotency_key"),
    round1Status: roundStatusEnum("round1_status").notNull().default("pending"),
    round2Status: roundStatusEnum("round2_status").notNull().default("pending"),
    round2Score: jsonb("round2_score"),
    round2Notes: text("round2_notes"),
    reviewedBy: uuid("reviewed_by").references(() => profiles.id),
    status: applicationStatusEnum("status").notNull().default("registered"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("recruitment_applications_user_year_uq").on(
      table.userId,
      table.academicYear,
    ),
    index("recruitment_applications_status_idx").on(table.status),
    index("recruitment_applications_domain_idx").on(table.domain),
    index("recruitment_applications_user_idx").on(table.userId),
  ],
);

export type RecruitmentWindow = typeof recruitmentWindows.$inferSelect;
export type RecruitmentApplication =
  typeof recruitmentApplications.$inferSelect;
export type InsertRecruitmentApplication =
  typeof recruitmentApplications.$inferInsert;
