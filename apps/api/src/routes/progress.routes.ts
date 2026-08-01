import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { updateProgressSchema } from "@learning/shared";
import { db } from "../db/client.js";
import { lessonProgress } from "../db/schema/index.js";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";

export const progressRouter = Router();

progressRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const rows = await db.select().from(lessonProgress).where(eq(lessonProgress.userId, req.user!.id));
  res.json(rows);
});

progressRouter.put("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = updateProgressSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { lessonId, status } = parsed.data;
  const userId = req.user!.id;

  const existing = await db
    .select({ id: lessonProgress.id })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));

  const now = new Date();
  if (existing.length > 0) {
    await db
      .update(lessonProgress)
      .set({
        status,
        lastVisitedAt: now,
        completedAt: status === "completed" ? now : null,
      })
      .where(eq(lessonProgress.id, existing[0].id));
  } else {
    await db.insert(lessonProgress).values({
      userId,
      lessonId,
      status,
      lastVisitedAt: now,
      completedAt: status === "completed" ? now : null,
    });
  }
  res.status(204).send();
});
