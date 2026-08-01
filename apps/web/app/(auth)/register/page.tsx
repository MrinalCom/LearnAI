"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AuthUser } from "@learning/shared";
import { apiFetch, ApiError } from "@/lib/api";
import { setToken } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token } = await apiFetch<{ user: AuthUser; token: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      setToken(token);
      router.push("/docs");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              placeholder="Password"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-fd-error">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating account…" : "Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-sm text-fd-muted-foreground">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}
