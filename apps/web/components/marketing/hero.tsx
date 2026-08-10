import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-fd-border">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, color-mix(in oklch, var(--color-fd-primary) 15%, transparent), transparent 40%), radial-gradient(circle at 80% 0%, color-mix(in oklch, var(--color-fd-primary) 10%, transparent), transparent 35%)",
        }}
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center">
        <span className="rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground">
          Free · Hands-on · Runs in your browser
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Learn AI end-to-end, <br className="hidden sm:block" />
          by building it.
        </h1>
        <p className="max-w-2xl text-balance text-lg text-fd-muted-foreground">
          Classical ML, deep learning, and agentic AI with LangChain and LangGraph — every lesson
          pairs the theory with a real, runnable simulation so you build intuition, not just read
          about it.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs/courses/classical-ml/instance-based-and-linear-models/knn"
            className={buttonVariants({ size: "lg" })}
          >
            Start learning <ArrowRight className="ml-1 size-4" />
          </Link>
          <Link href="/register" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Create a free account
          </Link>
        </div>
      </div>
    </section>
  );
}
