"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { QuizForLesson, QuizAttemptResult } from "@learning/shared";
import { apiFetch, authFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuizProps {
  courseSlug: string;
  moduleSlug: string;
  lessonSlug: string;
}

export function Quiz({ courseSlug, moduleSlug, lessonSlug }: QuizProps) {
  const [quiz, setQuiz] = useState<QuizForLesson | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    apiFetch<QuizForLesson>(`/api/quizzes/by-path/${courseSlug}/${moduleSlug}/${lessonSlug}`)
      .then(setQuiz)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load quiz"));
  }, [courseSlug, moduleSlug, lessonSlug]);

  async function submit() {
    if (!quiz) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await authFetch<QuizAttemptResult>(`/api/quizzes/${quiz.quizId}/attempts`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !quiz) {
    return <p className="not-prose text-sm text-fd-error">{error}</p>;
  }
  if (!quiz) {
    return <p className="not-prose text-sm text-fd-muted-foreground">Loading quiz…</p>;
  }

  const allAnswered = quiz.questions.every((q) => answers[q.id]);

  return (
    <Card className="not-prose my-6">
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {quiz.questions.map((q, i) => {
          const perQuestion = result?.perQuestion.find((p) => p.questionId === q.id);
          return (
            <div key={q.id} className="flex flex-col gap-2">
              <p className="text-sm font-medium">
                {i + 1}. {q.questionText}
              </p>
              <div className="flex flex-col gap-1.5">
                {q.options?.map((option) => (
                  <label
                    key={option}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border border-fd-border px-3 py-2 text-sm",
                      answers[q.id] === option && "border-fd-primary",
                      result &&
                        option === answers[q.id] &&
                        (perQuestion?.correct ? "border-fd-success bg-fd-success/10" : "border-fd-error bg-fd-error/10"),
                    )}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={option}
                      checked={answers[q.id] === option}
                      disabled={Boolean(result)}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: option }))}
                    />
                    {option}
                  </label>
                ))}
              </div>
              {perQuestion && !perQuestion.correct && perQuestion.explanation && (
                <p className="text-xs text-fd-muted-foreground">{perQuestion.explanation}</p>
              )}
            </div>
          );
        })}

        {!result && (
          <>
            {!user ? (
              <p className="text-sm text-fd-muted-foreground">
                <Link href="/login" className="underline">
                  Log in
                </Link>{" "}
                to save your quiz score.
              </p>
            ) : (
              <Button onClick={submit} disabled={!allAnswered || submitting} className="self-start">
                {submitting ? "Submitting…" : "Submit"}
              </Button>
            )}
            {error && <p className="text-sm text-fd-error">{error}</p>}
          </>
        )}

        {result && (
          <p className="text-sm font-medium">
            Score: {result.score} / {result.maxScore}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
