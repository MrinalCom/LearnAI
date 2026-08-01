import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { submitQuizAttemptSchema, type QuizForLesson, type QuizAttemptResult } from "@learning/shared";
import { db } from "../db/client.js";
import { courses, modules, lessons, quizzes, quizQuestions, quizAttempts } from "../db/schema/index.js";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";

export const quizRouter = Router();

quizRouter.get("/by-path/:courseSlug/:moduleSlug/:lessonSlug", async (req, res) => {
  const { courseSlug, moduleSlug, lessonSlug } = req.params;

  const [lesson] = await db
    .select({ id: lessons.id })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(and(eq(courses.slug, courseSlug), eq(modules.slug, moduleSlug), eq(lessons.slug, lessonSlug)));

  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found" });
  }

  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.lessonId, lesson.id));
  if (!quiz) {
    return res.status(404).json({ error: "This lesson has no quiz" });
  }

  const questions = await db
    .select({
      id: quizQuestions.id,
      quizId: quizQuestions.quizId,
      questionText: quizQuestions.questionText,
      questionType: quizQuestions.questionType,
      options: quizQuestions.options,
      orderIndex: quizQuestions.orderIndex,
    })
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quiz.id))
    .orderBy(quizQuestions.orderIndex);

  const body: QuizForLesson = { quizId: quiz.id, title: quiz.title, questions };
  res.json(body);
});

quizRouter.post("/:quizId/attempts", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = submitQuizAttemptSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { quizId } = req.params;
  const { answers } = parsed.data;

  const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quizId));
  if (questions.length === 0) {
    return res.status(404).json({ error: "Quiz not found" });
  }

  const perQuestion = questions.map((q) => ({
    questionId: q.id,
    correct: q.questionType === "mcq" && answers[q.id] === q.correctAnswer,
    explanation: q.explanation ?? undefined,
  }));
  const score = perQuestion.filter((p) => p.correct).length;
  const maxScore = questions.length;

  const [attempt] = await db
    .insert(quizAttempts)
    .values({
      userId: req.user!.id,
      quizId,
      submittedAt: new Date(),
      score: String(score),
      maxScore: String(maxScore),
      answers,
    })
    .returning({ id: quizAttempts.id });

  const body: QuizAttemptResult = { attemptId: attempt.id, score, maxScore, perQuestion };
  res.json(body);
});

quizRouter.get("/attempts", requireAuth, async (req: AuthedRequest, res) => {
  const quizId = String(req.query.quizId ?? "");
  if (!quizId) {
    return res.status(400).json({ error: "quizId query param is required" });
  }
  const rows = await db
    .select()
    .from(quizAttempts)
    .where(and(eq(quizAttempts.userId, req.user!.id), eq(quizAttempts.quizId, quizId)))
    .orderBy(desc(quizAttempts.submittedAt));
  res.json(rows);
});
