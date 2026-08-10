import { Sigma, BrainCircuit, Bot, Type, Search, ShieldCheck, Calculator, type LucideIcon } from "lucide-react";

export type Level = "Beginner" | "Beginner → Intermediate" | "Intermediate" | "Intermediate → Advanced" | "Advanced";

interface CourseMeta {
  icon: LucideIcon;
  bg: string;
  fg: string;
  level: Level;
  hours: string;
}

const DEFAULT_META: CourseMeta = {
  icon: Sigma,
  bg: "bg-brand-teal/15",
  fg: "text-brand-teal",
  level: "Beginner",
  hours: "~2 hours",
};

const COURSE_META: Record<string, CourseMeta> = {
  foundations: {
    icon: Calculator,
    bg: "bg-brand-sky/15",
    fg: "text-brand-sky",
    level: "Beginner",
    hours: "~2 hours",
  },
  "classical-ml": {
    icon: Sigma,
    bg: "bg-brand-indigo/15",
    fg: "text-brand-indigo",
    level: "Beginner",
    hours: "~4.5 hours",
  },
  "deep-learning": {
    icon: BrainCircuit,
    bg: "bg-brand-purple/15",
    fg: "text-brand-purple",
    level: "Intermediate",
    hours: "~3 hours",
  },
  "nlp-and-llm-foundations": {
    icon: Type,
    bg: "bg-brand-pink/15",
    fg: "text-brand-pink",
    level: "Intermediate",
    hours: "~2 hours",
  },
  rag: {
    icon: Search,
    bg: "bg-brand-amber/15",
    fg: "text-brand-amber",
    level: "Intermediate",
    hours: "~1.75 hours",
  },
  "agentic-ai": {
    icon: Bot,
    bg: "bg-brand-teal/15",
    fg: "text-brand-teal",
    level: "Beginner → Intermediate",
    hours: "~2.5 hours",
  },
  "applied-and-production": {
    icon: ShieldCheck,
    bg: "bg-brand-emerald/15",
    fg: "text-brand-emerald",
    level: "Intermediate → Advanced",
    hours: "~2.25 hours",
  },
};

export function getCourseMeta(slug: string): CourseMeta {
  return COURSE_META[slug] ?? DEFAULT_META;
}
