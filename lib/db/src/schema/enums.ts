import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "public",
  "member",
  "coordinator",
  "core_team",
]);

export const domainEnum = pgEnum("domain", [
  "android",
  "web",
  "ml",
  "iot",
  "arvr",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["upi", "cash"]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "cash_pending",
  "approved",
  "rejected",
]);

export const roundStatusEnum = pgEnum("round_status", [
  "pending",
  "cleared",
  "failed",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "registered",
  "round1_qualified",
  "round2_qualified",
  "selected",
  "rejected",
]);

export const resourceTypeEnum = pgEnum("resource_type", ["pdf", "link"]);

export const registrationScopeEnum = pgEnum("registration_scope", [
  "open",
  "members_only",
]);

export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "published",
  "past",
]);
