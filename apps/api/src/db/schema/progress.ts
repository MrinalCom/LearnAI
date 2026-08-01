import { pgTable, uuid, timestamp, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { lessons } from "./courses.js";

export const lessonStatusEnum = pgEnum("lesson_status", ["not_started", "in_progress", "completed"]);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    status: lessonStatusEnum("status").notNull().default("not_started"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    lastVisitedAt: timestamp("last_visited_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("lesson_progress_user_lesson_idx").on(table.userId, table.lessonId)],
);
