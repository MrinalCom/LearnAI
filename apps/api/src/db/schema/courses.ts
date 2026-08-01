import { pgTable, uuid, text, integer, boolean, timestamp, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const lessonTypeEnum = pgEnum("lesson_type", ["article", "playground", "quiz"]);

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const modules = pgTable(
  "modules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    orderIndex: integer("order_index").notNull().default(0),
    published: boolean("published").notNull().default(false),
  },
  (table) => [uniqueIndex("modules_course_slug_idx").on(table.courseId, table.slug)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    lessonType: lessonTypeEnum("lesson_type").notNull().default("article"),
    estimatedMinutes: integer("estimated_minutes").notNull().default(5),
    orderIndex: integer("order_index").notNull().default(0),
    published: boolean("published").notNull().default(false),
    prerequisiteLessonIds: uuid("prerequisite_lesson_ids")
      .array()
      .notNull()
      .default(sql`'{}'::uuid[]`),
  },
  (table) => [uniqueIndex("lessons_module_slug_idx").on(table.moduleId, table.slug)],
);
