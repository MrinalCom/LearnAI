"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LessonStatus } from "@learning/shared";
import { apiFetch, authFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
}
interface ModuleRow {
  id: string;
  slug: string;
  title: string;
  courseId: string;
}
interface LessonRow {
  id: string;
  slug: string;
  title: string;
  moduleId: string;
}
interface CourseDetail {
  course: CourseSummary;
  modules: ModuleRow[];
  lessons: LessonRow[];
}
interface ProgressRow {
  lessonId: string;
  status: LessonStatus;
}

function statusLabel(status: LessonStatus | undefined) {
  if (status === "completed") return { label: "Completed", variant: "success" as const };
  if (status === "in_progress") return { label: "In progress", variant: "secondary" as const };
  return { label: "Not started", variant: "outline" as const };
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [details, setDetails] = useState<CourseDetail[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const courses = await apiFetch<CourseSummary[]>("/api/courses");
      const courseDetails = await Promise.all(courses.map((c) => apiFetch<CourseDetail>(`/api/courses/${c.slug}`)));
      setDetails(courseDetails);
      setProgress(await authFetch<ProgressRow[]>("/api/progress"));
      setLoadingContent(false);
    })();
  }, [user]);

  if (loading) return null;

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-fd-muted-foreground">
          <Link href="/login" className="underline">
            Log in
          </Link>{" "}
          to see your progress.
        </p>
      </main>
    );
  }

  const progressByLesson = new Map(progress.map((p) => [p.lessonId, p.status]));

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-1 text-2xl font-semibold">My Progress</h1>
      <p className="mb-8 text-sm text-fd-muted-foreground">Welcome back, {user.name}.</p>

      {loadingContent && <p className="text-sm text-fd-muted-foreground">Loading…</p>}

      <div className="flex flex-col gap-6">
        {details.map(({ course, modules, lessons }) => {
          const completed = lessons.filter((l) => progressByLesson.get(l.id) === "completed").length;
          return (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>
                  {course.description} · {completed}/{lessons.length} lessons complete
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {modules.map((mod) => (
                  <div key={mod.id}>
                    <p className="mb-2 text-sm font-medium text-fd-muted-foreground">{mod.title}</p>
                    <div className="flex flex-col gap-1.5">
                      {lessons
                        .filter((l) => l.moduleId === mod.id)
                        .map((lesson) => {
                          const { label, variant } = statusLabel(progressByLesson.get(lesson.id));
                          return (
                            <Link
                              key={lesson.id}
                              href={`/docs/courses/${course.slug}/${mod.slug}/${lesson.slug}`}
                              className="flex items-center justify-between rounded-md border border-fd-border px-3 py-2 text-sm hover:bg-fd-accent"
                            >
                              <span>{lesson.title}</span>
                              <Badge variant={variant}>{label}</Badge>
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
