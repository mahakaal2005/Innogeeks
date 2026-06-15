import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { recruitmentApplications } from "./recruitment";
import { domainEnum } from "./enums";

export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  domain: domainEnum("domain"),
  academicYear: text("academic_year"),
  timeLimitSeconds: integer("time_limit_seconds"),
  passingScore: integer("passing_score").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(false),
  createdBy: uuid("created_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const quizQuestions = pgTable(
  "quiz_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    questionText: text("question_text").notNull(),
    options: jsonb("options").$type<string[]>().notNull(),
    correctOptionIndex: integer("correct_option_index").notNull(),
    marks: integer("marks").notNull().default(1),
    orderIndex: integer("order_index").notNull().default(0),
  },
  (table) => [index("quiz_questions_quiz_idx").on(table.quizId)],
);

export const quizSubmissions = pgTable(
  "quiz_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    applicationId: uuid("application_id").references(
      () => recruitmentApplications.id,
    ),
    answers: jsonb("answers").$type<Record<string, number>>().notNull(),
    score: integer("score").notNull(),
    total: integer("total").notNull(),
    passed: boolean("passed").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("quiz_submissions_quiz_email_uq").on(table.quizId, table.email),
    index("quiz_submissions_quiz_idx").on(table.quizId),
  ],
);

export type Quiz = typeof quizzes.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type QuizSubmission = typeof quizSubmissions.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;
