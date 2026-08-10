import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ExplainedTwice({ children }: { children: ReactNode }) {
  return <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Panel({ label, color, children }: { label: string; color: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-fd-border bg-fd-card p-4">
      <span className={cn("mb-2 block text-xs font-semibold uppercase tracking-wide", color)}>{label}</span>
      <div className="prose-sm text-sm leading-relaxed text-fd-foreground [&>p:last-child]:mb-0 [&>p]:mb-2">
        {children}
      </div>
    </div>
  );
}

export function ForBeginners({ children }: { children: ReactNode }) {
  return (
    <Panel label="For Beginners" color="text-brand-teal">
      {children}
    </Panel>
  );
}

export function ForEngineers({ children }: { children: ReactNode }) {
  return (
    <Panel label="For Engineers" color="text-brand-purple">
      {children}
    </Panel>
  );
}
