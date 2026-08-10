"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
}
interface ModuleRow {
  id: string;
  slug: string;
  orderIndex: number;
}
interface LessonRow {
  id: string;
  slug: string;
  moduleId: string;
  orderIndex: number;
}
interface CourseDetail {
  course: CourseSummary;
  modules: ModuleRow[];
  lessons: LessonRow[];
}

export function CourseGrid() {
  const [details, setDetails] = useState<CourseDetail[] | null>(null);

  useEffect(() => {
    apiFetch<CourseSummary[]>("/api/courses")
      .then((courses) => Promise.all(courses.map((c) => apiFetch<CourseDetail>(`/api/courses/${c.slug}`))))
      .then(setDetails)
      .catch(() => setDetails([]));
  }, []);

  if (!details) {
    return <p className="mx-auto max-w-6xl px-6 text-sm text-fd-muted-foreground">Loading courses…</p>;
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <h2 className="mb-6 text-2xl font-semibold">Courses</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {details.map(({ course, modules, lessons }) => {
          const firstModule = [...modules].sort((a, b) => a.orderIndex - b.orderIndex)[0];
          const firstLesson = lessons
            .filter((l) => l.moduleId === firstModule?.id)
            .sort((a, b) => a.orderIndex - b.orderIndex)[0];
          const href = firstLesson ? `/docs/courses/${course.slug}/${firstModule.slug}/${firstLesson.slug}` : "/docs";

          return (
            <Card key={course.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="mb-2 flex items-center gap-2 text-fd-muted-foreground">
                  <BookOpen className="size-4" />
                  <span className="text-xs">
                    {modules.length} modules · {lessons.length} lessons
                  </span>
                </div>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={href} className={buttonVariants({ variant: "secondary", className: "w-full" })}>
                  Start course
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
