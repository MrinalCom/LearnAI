import { Boxes, FlaskConical, LineChart, ListChecks } from "lucide-react";

const FEATURES = [
  {
    icon: FlaskConical,
    title: "Real code, in your browser",
    description:
      "Every playground runs actual Python (Pyodide + scikit-learn) or a real LangGraph agent — no setup, no server round-trip for the ML lessons.",
  },
  {
    icon: Boxes,
    title: "Live simulations, not just diagrams",
    description:
      "Drag a point through a KNN decision boundary, step a K-Means clustering to convergence, watch an agent graph execute node by node.",
  },
  {
    icon: ListChecks,
    title: "Check your understanding",
    description: "Every lesson ends with a scored quiz, so you know what actually stuck before moving on.",
  },
  {
    icon: LineChart,
    title: "Track real progress",
    description: "Sign in once and your completed lessons, quiz scores, and course progress follow you everywhere.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-lg border border-fd-border bg-fd-card p-5">
            <Icon className="mb-3 size-6 text-fd-primary" />
            <h3 className="mb-1.5 font-semibold">{title}</h3>
            <p className="text-sm text-fd-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
