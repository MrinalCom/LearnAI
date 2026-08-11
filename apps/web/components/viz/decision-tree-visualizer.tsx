"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Label = 0 | 1;
interface Point {
  x: number;
  y: number;
  label: Label;
}
interface Region {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  pointIdxs: number[];
}
interface Split {
  axis: "x" | "y";
  threshold: number;
  gain: number;
}

const WIDTH = 400;
const HEIGHT = 300;
const COLORS: Record<Label, string> = { 0: "#6366f1", 1: "#f59e0b" };

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
  const rand = mulberry32(21);
  const points: Point[] = [];
  // Two clusters with a bit of overlap, so the tree needs more than one split to separate them well.
  const blobs: { cx: number; cy: number; label: Label }[] = [
    { cx: 145, cy: 110, label: 0 },
    { cx: 250, cy: 190, label: 1 },
  ];
  for (const blob of blobs) {
    for (let i = 0; i < 22; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = rand() * 90;
      points.push({
        x: Math.max(5, Math.min(WIDTH - 5, blob.cx + Math.cos(angle) * radius)),
        y: Math.max(5, Math.min(HEIGHT - 5, blob.cy + Math.sin(angle) * radius)),
        label: blob.label,
      });
    }
  }
  return points;
}

const POINTS = generatePoints();

function gini(idxs: number[]): number {
  if (idxs.length === 0) return 0;
  const count1 = idxs.filter((i) => POINTS[i].label === 1).length;
  const p1 = count1 / idxs.length;
  const p0 = 1 - p1;
  return 1 - (p0 * p0 + p1 * p1);
}

function majorityLabel(idxs: number[]): Label {
  const count1 = idxs.filter((i) => POINTS[i].label === 1).length;
  return count1 * 2 >= idxs.length ? 1 : 0;
}

function bestSplit(region: Region): Split | null {
  const parentGini = gini(region.pointIdxs);
  if (parentGini === 0 || region.pointIdxs.length < 4) return null;

  let best: Split | null = null;
  for (const axis of ["x", "y"] as const) {
    const values = [...new Set(region.pointIdxs.map((i) => POINTS[i][axis]))].sort((a, b) => a - b);
    for (let i = 0; i < values.length - 1; i++) {
      const threshold = (values[i] + values[i + 1]) / 2;
      const left = region.pointIdxs.filter((idx) => POINTS[idx][axis] <= threshold);
      const right = region.pointIdxs.filter((idx) => POINTS[idx][axis] > threshold);
      if (left.length === 0 || right.length === 0) continue;
      const weightedGini = (left.length * gini(left) + right.length * gini(right)) / region.pointIdxs.length;
      const gain = parentGini - weightedGini;
      if (!best || gain > best.gain) best = { axis, threshold, gain };
    }
  }
  return best && best.gain > 1e-6 ? best : null;
}

function splitRegion(region: Region, split: Split): [Region, Region] {
  if (split.axis === "x") {
    return [
      { ...region, x1: split.threshold, pointIdxs: region.pointIdxs.filter((i) => POINTS[i].x <= split.threshold) },
      { ...region, x0: split.threshold, pointIdxs: region.pointIdxs.filter((i) => POINTS[i].x > split.threshold) },
    ];
  }
  return [
    { ...region, y1: split.threshold, pointIdxs: region.pointIdxs.filter((i) => POINTS[i].y <= split.threshold) },
    { ...region, y0: split.threshold, pointIdxs: region.pointIdxs.filter((i) => POINTS[i].y > split.threshold) },
  ];
}

const ROOT: Region = { x0: 0, y0: 0, x1: WIDTH, y1: HEIGHT, pointIdxs: POINTS.map((_, i) => i) };

export function DecisionTreeVisualizer() {
  const [regions, setRegions] = useState<Region[]>([ROOT]);

  const splittable = useMemo(
    () => regions.map((r) => ({ region: r, split: bestSplit(r) })).filter((r) => r.split !== null),
    [regions],
  );

  function step() {
    if (splittable.length === 0) return;
    // Split whichever eligible region currently has the most impurity to resolve, weighted by size.
    const target = splittable.reduce((best, cur) =>
      cur.region.pointIdxs.length * gini(cur.region.pointIdxs) > best.region.pointIdxs.length * gini(best.region.pointIdxs)
        ? cur
        : best,
    );
    const [left, right] = splitRegion(target.region, target.split!);
    setRegions((prev) => [...prev.filter((r) => r !== target.region), left, right]);
  }

  function reset() {
    setRegions([ROOT]);
  }

  const depth = Math.ceil(Math.log2(regions.length + 1));

  return (
    <div className="not-prose my-6 rounded-lg border border-fd-border bg-fd-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <span className="text-sm text-fd-muted-foreground">
          {regions.length} leaf region{regions.length !== 1 ? "s" : ""} · depth ≈ {depth}
        </span>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={step} disabled={splittable.length === 0}>
            {splittable.length === 0 ? "Fully grown" : "Split"}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-lg rounded-md border border-fd-border bg-fd-background">
        {regions.map((r, i) => {
          const label = majorityLabel(r.pointIdxs);
          return (
            <rect
              key={i}
              x={r.x0}
              y={r.y0}
              width={r.x1 - r.x0}
              height={r.y1 - r.y0}
              fill={COLORS[label]}
              opacity={0.12}
              stroke="currentColor"
              strokeOpacity={0.3}
              strokeWidth={1}
            />
          );
        })}
        {POINTS.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={COLORS[p.label]} stroke="white" strokeWidth={1} />
        ))}
      </svg>
      <p className="mt-2 text-xs text-fd-muted-foreground">
        Each &quot;Split&quot; finds the single axis-aligned cut (across whichever leaf region needs it most) that
        reduces Gini impurity the most — exactly the greedy algorithm real decision trees use. Watch how few
        splits it takes to separate these two clusters, and how the boundaries stay perfectly rectangular.
      </p>
    </div>
  );
}
