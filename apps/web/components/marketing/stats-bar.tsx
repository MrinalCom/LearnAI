const STATS = [
  { value: "6", label: "courses" },
  { value: "54", label: "in-depth lessons" },
  { value: "27+", label: "live code playgrounds" },
  { value: "54", label: "scored quizzes" },
];

export function StatsBar() {
  return (
    <section className="border-b border-fd-border">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-xs text-fd-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
