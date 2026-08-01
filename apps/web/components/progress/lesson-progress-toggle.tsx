"use client";

import { useEffect, useState } from "react";
import type { LessonStatus } from "@learning/shared";
import { apiFetch, authFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

interface LessonRow {
  id: string;
  slug: string;
  moduleId: string;
}
interface ModuleRow {
  id: string;
  slug: string;
}
interface CourseDetail {
  modules: ModuleRow[];
  lessons: LessonRow[];
}

interface LessonProgressToggleProps {
  courseSlug: string;
  moduleSlug: string;
  lessonSlug: string;
}

export function LessonProgressToggle({ courseSlug, moduleSlug, lessonSlug }: LessonProgressToggleProps) {
  const { user } = useAuth();
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [status, setStatus] = useState<LessonStatus>("not_started");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    apiFetch<CourseDetail>(`/api/courses/${courseSlug}`).then((detail) => {
      const mod = detail.modules.find((m) => m.slug === moduleSlug);
      const lesson = detail.lessons.find((l) => l.slug === lessonSlug && l.moduleId === mod?.id);
      if (!lesson) return;
      setLessonId(lesson.id);
      authFetch<{ lessonId: string; status: LessonStatus }[]>("/api/progress").then((rows) => {
        const row = rows.find((r) => r.lessonId === lesson.id);
        if (row) setStatus(row.status);
      });
    });
  }, [user, courseSlug, moduleSlug, lessonSlug]);

  async function toggle() {
    if (!lessonId) return;
    const next: LessonStatus = status === "completed" ? "not_started" : "completed";
    setSaving(true);
    try {
      await authFetch("/api/progress", { method: "PUT", body: JSON.stringify({ lessonId, status: next }) });
      setStatus(next);
    } finally {
      setSaving(false);
    }
  }

  if (!user || !lessonId) return null;

  return (
    <Button variant={status === "completed" ? "secondary" : "default"} size="sm" onClick={toggle} disabled={saving}>
      {status === "completed" ? "✓ Completed" : "Mark as complete"}
    </Button>
  );
}
