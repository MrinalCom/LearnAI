import { z } from "zod";

export const lessonTypeSchema = z.enum(["article", "playground", "quiz"]);
export type LessonType = z.infer<typeof lessonTypeSchema>;

/** Frontmatter contract for every lesson MDX file under apps/web/content/courses/**. */
export const lessonFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number().int().nonnegative(),
  estimatedMinutes: z.number().int().positive(),
  type: lessonTypeSchema,
  prerequisites: z.array(z.string()).default([]),
  objectives: z.array(z.string()).default([]),
});
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;

export const courseSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  orderIndex: z.number().int(),
});
export type CourseSummary = z.infer<typeof courseSummarySchema>;

export const lessonSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  moduleId: z.string().uuid(),
  title: z.string(),
  lessonType: lessonTypeSchema,
  estimatedMinutes: z.number().int(),
  orderIndex: z.number().int(),
});
export type LessonSummary = z.infer<typeof lessonSummarySchema>;
