import { pgTable, uuid, text, integer, numeric, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { lessons } from "./courses.js";

export const questionTypeEnum = pgEnum("question_type", ["mcq", "short_answer", "code"]);

export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id")
    .notNull()
    .unique()
    .references(() => lessons.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  questionType: questionTypeEnum("question_type").notNull().default("mcq"),
  options: jsonb("options").$type<string[]>(),
  correctAnswer: jsonb("correct_answer").notNull(),
  explanation: text("explanation"),
  orderIndex: integer("order_index").notNull().default(0),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  score: numeric("score", { precision: 5, scale: 2 }),
  maxScore: numeric("max_score", { precision: 5, scale: 2 }),
  answers: jsonb("answers").$type<Record<string, string>>(),
});
