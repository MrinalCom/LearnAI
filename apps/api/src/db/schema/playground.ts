import { pgTable, uuid, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { lessons } from "./courses.js";

export const playgroundLanguageEnum = pgEnum("playground_language", ["python", "javascript"]);
export const playgroundStatusEnum = pgEnum("playground_status", ["success", "error", "timeout"]);

/** Server-side (Tier 3/E2B) execution log — used to re-verify quiz-linked code output rather than trusting the client. */
export const playgroundExecutions = pgTable("playground_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  lessonId: uuid("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  language: playgroundLanguageEnum("language").notNull(),
  code: text("code").notNull(),
  status: playgroundStatusEnum("status").notNull(),
  output: text("output"),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
