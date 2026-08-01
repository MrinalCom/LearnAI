"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Point = { x: number; y: number };

const WIDTH = 400;
const HEIGHT = 400;
const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

// Deterministic PRNG (mulberry32) so the point cloud is identical on server and client renders.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generatePoints(): Point[] {
  const rand = mulberry32(7);
  const blobs = [
    { cx: 110, cy: 110 },
    { cx: 300, cy: 130 },
    { cx: 190, cy: 300 },
  ];
  const points: Point[] = [];
  for (const blob of blobs) {
    for (let i = 0; i < 14; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = rand() * 65;
      points.push({ x: blob.cx + Math.cos(angle) * radius, y: blob.cy + Math.sin(angle) * radius });
    }
  }
  return points;
}

const POINTS = generatePoints();

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function initialCentroids(k: number): Point[] {
  const step = Math.floor(POINTS.length / k);
  return Array.from({ length: k }, (_, i) => POINTS[i * step]);
}

function assign(centroids: Point[]): number[] {
  return POINTS.map((p) => {
    let best = 0;
    let bestDist = Infinity;
    centroids.forEach((c, i) => {
      const d = distance(p, c);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  });
}

function updateCentroids(assignments: number[], k: number): Point[] {
  return Array.from({ length: k }, (_, i) => {
    const members = POINTS.filter((_, idx) => assignments[idx] === i);
    if (members.length === 0) return initialCentroids(k)[i];
    return {
      x: members.reduce((s, p) => s + p.x, 0) / members.length,
      y: members.reduce((s, p) => s + p.y, 0) / members.length,
    };
  });
}

export function KMeansVisualizer() {
  const [k, setK] = useState(3);
  const [centroids, setCentroids] = useState<Point[]>(() => initialCentroids(3));
  const [iteration, setIteration] = useState(0);

  const assignments = useMemo(() => assign(centroids), [centroids]);

  function step() {
    setCentroids(updateCentroids(assignments, k));
    setIteration((i) => i + 1);
  }

  function reset(newK: number) {
    setK(newK);
    setCentroids(initialCentroids(newK));
    setIteration(0);
  }

  return (
    <div className="not-prose my-6 rounded-lg border border-fd-border bg-fd-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm text-fd-muted-foreground">
          k = {k}
          <input
            type="range"
            min={2}
            max={6}
            value={k}
            onChange={(e) => reset(Number(e.target.value))}
            className="w-40"
          />
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-fd-muted-foreground">Iteration {iteration}</span>
          <Button size="sm" onClick={step}>
            Step
          </Button>
          <Button size="sm" variant="outline" onClick={() => reset(k)}>
            Reset
          </Button>
        </div>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-md rounded-md border border-fd-border">
        {POINTS.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={5} fill={COLORS[assignments[i] % COLORS.length]} stroke="white" strokeWidth={1} />
        ))}
        {centroids.map((c, i) => (
          <g key={i}>
            <line x1={c.x - 8} y1={c.y - 8} x2={c.x + 8} y2={c.y + 8} stroke="white" strokeWidth={4} />
            <line x1={c.x - 8} y1={c.y + 8} x2={c.x + 8} y2={c.y - 8} stroke="white" strokeWidth={4} />
            <line x1={c.x - 8} y1={c.y - 8} x2={c.x + 8} y2={c.y + 8} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
            <line x1={c.x - 8} y1={c.y + 8} x2={c.x + 8} y2={c.y - 8} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
          </g>
        ))}
      </svg>
      <p className="mt-2 text-xs text-fd-muted-foreground">
        Click &quot;Step&quot; repeatedly to watch the centroids (X markers) converge: each step reassigns every
        point to its nearest centroid, then moves each centroid to the mean of its assigned points.
      </p>
    </div>
  );
}
