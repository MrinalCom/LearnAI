"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type Label = 0 | 1;
type Point = { x: number; y: number; label: Label };

const WIDTH = 400;
const HEIGHT = 400;
const GRID_STEP = 12;

const COLORS: Record<Label, string> = {
  0: "#6366f1",
  1: "#f59e0b",
};

// Deterministic PRNG (mulberry32) so the training set is identical on server and client renders — avoids hydration mismatches from Math.random().
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateTrainingPoints(): Point[] {
  const rand = mulberry32(42);
  const blobs: { cx: number; cy: number; label: Label }[] = [
    { cx: 130, cy: 150, label: 0 },
    { cx: 270, cy: 250, label: 1 },
  ];
  const points: Point[] = [];
  for (const blob of blobs) {
    for (let i = 0; i < 16; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = rand() * 70;
      points.push({
        x: blob.cx + Math.cos(angle) * radius,
        y: blob.cy + Math.sin(angle) * radius,
        label: blob.label,
      });
    }
  }
  return points;
}

const TRAINING_POINTS = generateTrainingPoints();

function distance(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function classify(x: number, y: number, k: number): { label: Label; neighbors: Point[] } {
  const neighbors = [...TRAINING_POINTS]
    .sort((a, b) => distance(x, y, a.x, a.y) - distance(x, y, b.x, b.y))
    .slice(0, k);
  const votes = neighbors.reduce((acc, p) => acc + (p.label === 1 ? 1 : -1), 0);
  return { label: votes >= 0 ? 1 : 0, neighbors };
}

export function KnnVisualizer() {
  const [k, setK] = useState(3);
  const [query, setQuery] = useState({ x: 200, y: 200 });
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const { label: predictedLabel, neighbors } = useMemo(() => classify(query.x, query.y, k), [query, k]);

  const decisionCells = useMemo(() => {
    const cells: { x: number; y: number; label: Label }[] = [];
    for (let gx = 0; gx < WIDTH; gx += GRID_STEP) {
      for (let gy = 0; gy < HEIGHT; gy += GRID_STEP) {
        cells.push({ x: gx, y: gy, label: classify(gx + GRID_STEP / 2, gy + GRID_STEP / 2, k).label });
      }
    }
    return cells;
  }, [k]);

  const updateQueryFromEvent = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setQuery({
      x: Math.min(WIDTH, Math.max(0, ((e.clientX - rect.left) / rect.width) * WIDTH)),
      y: Math.min(HEIGHT, Math.max(0, ((e.clientY - rect.top) / rect.height) * HEIGHT)),
    });
  }, []);

  return (
    <div className="not-prose my-6 rounded-lg border border-fd-border bg-fd-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm text-fd-muted-foreground">
          k = {k}
          <input
            type="range"
            min={1}
            max={15}
            step={2}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            className="w-40"
          />
        </label>
        <span className="text-sm">
          Predicted class:{" "}
          <span className="font-semibold" style={{ color: COLORS[predictedLabel] }}>
            {predictedLabel === 0 ? "Class A" : "Class B"}
          </span>
        </span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full max-w-md touch-none select-none rounded-md border border-fd-border cursor-crosshair"
        onDragStart={(e) => e.preventDefault()}
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          updateQueryFromEvent(e);
        }}
        onPointerMove={(e) => dragging && updateQueryFromEvent(e)}
        onPointerUp={(e) => {
          setDragging(false);
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
      >
        {decisionCells.map((cell, i) => (
          <rect key={i} x={cell.x} y={cell.y} width={GRID_STEP} height={GRID_STEP} fill={COLORS[cell.label]} opacity={0.08} />
        ))}
        {neighbors.map((n, i) => (
          <line key={i} x1={query.x} y1={query.y} x2={n.x} y2={n.y} stroke="currentColor" strokeOpacity={0.3} />
        ))}
        {TRAINING_POINTS.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={5} fill={COLORS[p.label]} stroke="white" strokeWidth={1} />
        ))}
        <circle cx={query.x} cy={query.y} r={7} fill={COLORS[predictedLabel]} stroke="black" strokeWidth={2} />
      </svg>
      <p className="mt-2 text-xs text-fd-muted-foreground">
        Drag the black-outlined point around the canvas. It&apos;s classified by majority vote among its {k} nearest
        neighbors (connecting lines) — watch the shaded decision boundary sharpen or smooth out as you change k.
      </p>
    </div>
  );
}
