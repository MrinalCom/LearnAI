import { Sigma, BrainCircuit, Bot, type LucideIcon } from "lucide-react";

interface CourseMeta {
  icon: LucideIcon;
  bg: string;
  fg: string;
}

const DEFAULT_META: CourseMeta = { icon: Sigma, bg: "bg-brand-teal/15", fg: "text-brand-teal" };

const COURSE_META: Record<string, CourseMeta> = {
  "classical-ml": { icon: Sigma, bg: "bg-brand-indigo/15", fg: "text-brand-indigo" },
  "deep-learning": { icon: BrainCircuit, bg: "bg-brand-purple/15", fg: "text-brand-purple" },
  "agentic-ai": { icon: Bot, bg: "bg-brand-teal/15", fg: "text-brand-teal" },
};

export function getCourseMeta(slug: string): CourseMeta {
  return COURSE_META[slug] ?? DEFAULT_META;
}
