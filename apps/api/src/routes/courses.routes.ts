import { Router } from "express";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/client.js";
import { courses, modules, lessons } from "../db/schema/index.js";

export const coursesRouter = Router();

coursesRouter.get("/", async (_req, res) => {
  const rows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      description: courses.description,
      orderIndex: courses.orderIndex,
    })
    .from(courses)
    .where(eq(courses.published, true))
    .orderBy(asc(courses.orderIndex));
  res.json(rows);
});

coursesRouter.get("/:slug", async (req, res) => {
  const [course] = await db.select().from(courses).where(eq(courses.slug, req.params.slug));
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  const courseModules = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, course.id))
    .orderBy(asc(modules.orderIndex));

  const moduleIds = courseModules.map((m) => m.id);
  const moduleLessons = moduleIds.length
    ? await db
        .select()
        .from(lessons)
        .where(inArray(lessons.moduleId, moduleIds))
        .orderBy(asc(lessons.orderIndex))
    : [];

  res.json({ course, modules: courseModules, lessons: moduleLessons });
});
