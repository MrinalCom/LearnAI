import { z } from "zod";

export const lessonStatusSchema = z.enum(["not_started", "in_progress", "completed"]);
export type LessonStatus = z.infer<typeof lessonStatusSchema>;

export const updateProgressSchema = z.object({
  lessonId: z.string().uuid(),
  status: lessonStatusSchema,
});
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

export const lessonProgressSchema = z.object({
  lessonId: z.string().uuid(),
  status: lessonStatusSchema,
  completedAt: z.string().datetime().nullable(),
  lastVisitedAt: z.string().datetime().nullable(),
});
export type LessonProgress = z.infer<typeof lessonProgressSchema>;
