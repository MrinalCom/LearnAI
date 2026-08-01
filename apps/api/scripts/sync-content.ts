import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { eq } from "drizzle-orm";
import { lessonFrontmatterSchema, quizFileSchema } from "@learning/shared";
import { db, pool } from "../src/db/client.js";
import { courses, modules, lessons, quizzes, quizQuestions } from "../src/db/schema/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = path.resolve(__dirname, "../../web/content/docs/courses");

interface FolderMeta {
  title: string;
  description: string;
  order: number;
}

function readMeta(dir: string): FolderMeta {
  const raw = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf-8"));
  return { title: raw.title, description: raw.description ?? "", order: raw.order ?? 0 };
}

function subdirs(dir: string) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function main() {
  for (const courseSlug of subdirs(CONTENT_ROOT)) {
    const coursePath = path.join(CONTENT_ROOT, courseSlug);
    const courseMeta = readMeta(coursePath);

    const [course] = await db
      .insert(courses)
      .values({
        slug: courseSlug,
        title: courseMeta.title,
        description: courseMeta.description,
        orderIndex: courseMeta.order,
        published: true,
      })
      .onConflictDoUpdate({
        target: courses.slug,
        set: { title: courseMeta.title, description: courseMeta.description, orderIndex: courseMeta.order, published: true },
      })
      .returning();

    console.log(`course  ${courseSlug}`);

    for (const moduleSlug of subdirs(coursePath)) {
      const modulePath = path.join(coursePath, moduleSlug);
      const moduleMeta = readMeta(modulePath);

      const [mod] = await db
        .insert(modules)
        .values({
          courseId: course.id,
          slug: moduleSlug,
          title: moduleMeta.title,
          orderIndex: moduleMeta.order,
          published: true,
        })
        .onConflictDoUpdate({
          target: [modules.courseId, modules.slug],
          set: { title: moduleMeta.title, orderIndex: moduleMeta.order, published: true },
        })
        .returning();

      console.log(`  module ${moduleSlug}`);

      const lessonFiles = fs
        .readdirSync(modulePath)
        .filter((file) => file.endsWith(".mdx"))
        .sort();

      for (const file of lessonFiles) {
        const lessonSlug = file.replace(/\.mdx$/, "");
        const raw = fs.readFileSync(path.join(modulePath, file), "utf-8");
        const fm = lessonFrontmatterSchema.parse(matter(raw).data);

        const [lesson] = await db
          .insert(lessons)
          .values({
            moduleId: mod.id,
            slug: lessonSlug,
            title: fm.title,
            lessonType: fm.type,
            estimatedMinutes: fm.estimatedMinutes,
            orderIndex: fm.order,
            published: true,
          })
          .onConflictDoUpdate({
            target: [lessons.moduleId, lessons.slug],
            set: {
              title: fm.title,
              lessonType: fm.type,
              estimatedMinutes: fm.estimatedMinutes,
              orderIndex: fm.order,
              published: true,
            },
          })
          .returning();

        console.log(`    lesson ${lessonSlug}`);

        const quizPath = path.join(modulePath, `${lessonSlug}.quiz.json`);
        if (fs.existsSync(quizPath)) {
          const quizFile = quizFileSchema.parse(JSON.parse(fs.readFileSync(quizPath, "utf-8")));

          const [quiz] = await db
            .insert(quizzes)
            .values({ lessonId: lesson.id, title: quizFile.title })
            .onConflictDoUpdate({ target: quizzes.lessonId, set: { title: quizFile.title } })
            .returning();

          // Authored quiz content, not user data — safe to fully replace on each sync.
          await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quiz.id));
          await db.insert(quizQuestions).values(
            quizFile.questions.map((q, i) => ({
              quizId: quiz.id,
              questionText: q.questionText,
              questionType: q.questionType,
              options: q.options ?? null,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              orderIndex: i,
            })),
          );

          console.log(`      quiz (${quizFile.questions.length} questions)`);
        }
      }
    }
  }

  await pool.end();
  console.log("Content sync complete.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
