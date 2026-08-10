import { Sigma, BrainCircuit, Bot, Type, Search, ShieldCheck, type LucideIcon } from "lucide-react";

interface CourseMeta {
  icon: LucideIcon;
  bg: string;
  fg: string;
}

const DEFAULT_META: CourseMeta = { icon: Sigma, bg: "bg-brand-teal/15", fg: "text-brand-teal" };

const COURSE_META: Record<string, CourseMeta> = {
  "classical-ml": { icon: Sigma, bg: "bg-brand-indigo/15", fg: "text-brand-indigo" },
  "deep-learning": { icon: BrainCircuit, bg: "bg-brand-purple/15", fg: "text-brand-purple" },
  "nlp-and-llm-foundations": { icon: Type, bg: "bg-brand-pink/15", fg: "text-brand-pink" },
  rag: { icon: Search, bg: "bg-brand-amber/15", fg: "text-brand-amber" },
  "agentic-ai": { icon: Bot, bg: "bg-brand-teal/15", fg: "text-brand-teal" },
  "applied-and-production": { icon: ShieldCheck, bg: "bg-brand-emerald/15", fg: "text-brand-emerald" },
};

export function getCourseMeta(slug: string): CourseMeta {
  return COURSE_META[slug] ?? DEFAULT_META;
}
