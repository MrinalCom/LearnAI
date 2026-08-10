"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getCourseMeta } from "@/lib/course-meta";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    apiFetch<CourseSummary[]>("/api/courses")
      .then((courses) => Promise.all(courses.map((c) => apiFetch<CourseDetail>(`/api/courses/${c.slug}`))))
      .then(setDetails)
      .catch(() => setDetails([]));
  }, []);

  const visible = useMemo(
    () => (details ?? []).filter((d) => filter === "all" || d.course.slug === filter),
    [details, filter],
  );

  if (!details) {
    return <p className="mx-auto max-w-6xl px-6 text-sm text-fd-muted-foreground">Loading courses…</p>;
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <h2 className="mb-4 text-2xl font-semibold">Courses</h2>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
          All courses
        </FilterPill>
        {details.map(({ course }) => (
          <FilterPill key={course.id} active={filter === course.slug} onClick={() => setFilter(course.slug)}>
            {course.title}
          </FilterPill>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ course, modules, lessons }) => {
          const firstModule = [...modules].sort((a, b) => a.orderIndex - b.orderIndex)[0];
          const firstLesson = lessons
            .filter((l) => l.moduleId === firstModule?.id)
            .sort((a, b) => a.orderIndex - b.orderIndex)[0];
          const href = firstLesson ? `/docs/courses/${course.slug}/${firstModule.slug}/${firstLesson.slug}` : "/docs";
          const { icon: Icon, bg, fg, level, hours } = getCourseMeta(course.slug);

          return (
            <Card key={course.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <div className={cn("flex size-10 items-center justify-center rounded-lg", bg)}>
                    <Icon className={cn("size-5", fg)} />
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide", bg, fg)}>
                    {lessons.length} lessons
                  </span>
                </div>
                <CardTitle>{course.title}</CardTitle>
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-fd-muted-foreground">
                  <span className={fg}>{level}</span>
                  <span aria-hidden>·</span>
                  <span>{hours}</span>
                </div>
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

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
          : "border-fd-border bg-fd-card text-fd-muted-foreground hover:text-fd-foreground",
      )}
    >
      {children}
    </button>
  );
}
