import { z } from "zod";

export const questionTypeSchema = z.enum(["mcq", "short_answer", "code"]);
export type QuestionType = z.infer<typeof questionTypeSchema>;

export const quizQuestionSchema = z.object({
  id: z.string().uuid(),
  quizId: z.string().uuid(),
  questionText: z.string(),
  questionType: questionTypeSchema,
  options: z.array(z.string()).nullable(),
  orderIndex: z.number().int(),
});
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

export const submitQuizAttemptSchema = z.object({
  answers: z.record(z.string().uuid(), z.string()),
});
export type SubmitQuizAttemptInput = z.infer<typeof submitQuizAttemptSchema>;

export const quizAttemptResultSchema = z.object({
  attemptId: z.string().uuid(),
  score: z.number(),
  maxScore: z.number(),
  perQuestion: z.array(
    z.object({
      questionId: z.string().uuid(),
      correct: z.boolean(),
      explanation: z.string().optional(),
    }),
  ),
});
export type QuizAttemptResult = z.infer<typeof quizAttemptResultSchema>;

export const quizForLessonSchema = z.object({
  quizId: z.string().uuid(),
  title: z.string(),
  questions: z.array(quizQuestionSchema),
});
export type QuizForLesson = z.infer<typeof quizForLessonSchema>;

/** Authoring format for `<lesson-slug>.quiz.json`, sitting alongside the lesson's .mdx file. */
export const quizFileQuestionSchema = z.object({
  questionText: z.string(),
  questionType: questionTypeSchema.default("mcq"),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string().optional(),
});
export type QuizFileQuestion = z.infer<typeof quizFileQuestionSchema>;

export const quizFileSchema = z.object({
  title: z.string(),
  questions: z.array(quizFileQuestionSchema).min(1),
});
export type QuizFile = z.infer<typeof quizFileSchema>;
