"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const WIDTH = 420;
const HEIGHT = 260;
const PAD = 30;
const TARGET_W = 6; // the "true" minimum, in problem-space units (0-10)
const START_W = 0.5;

// Loss(w) = (w - target)^2 + 0.5 -- a simple convex bowl, easy to reason about.
function loss(w: number) {
  return (w - TARGET_W) ** 2 + 0.5;
}
function gradient(w: number) {
  return 2 * (w - TARGET_W);
}

// Map problem-space (w in [0,10], loss in [0, ~40]) to SVG pixel space.
function toSvgX(w: number) {
  return PAD + (w / 10) * (WIDTH - 2 * PAD);
}
function toSvgY(l: number) {
  const maxLoss = 40;
  return HEIGHT - PAD - (l / maxLoss) * (HEIGHT - 2 * PAD);
}

const CURVE_POINTS = Array.from({ length: 60 }, (_, i) => {
  const w = (i / 59) * 10;
  return `${toSvgX(w)},${toSvgY(loss(w))}`;
}).join(" ");

export function GradientDescentVisualizer() {
  const [w, setW] = useState(START_W);
  const [lr, setLr] = useState(0.1);
  const [history, setHistory] = useState<number[]>([START_W]);

  const currentLoss = loss(w);
  const diverged = !Number.isFinite(w) || Math.abs(w) > 1000;

  const trailPoints = useMemo(
    () => history.map((hw) => `${toSvgX(Math.max(-2, Math.min(12, hw)))},${toSvgY(Math.min(40, loss(hw)))}`),
    [history],
  );

  function step() {
    if (diverged) return;
    const next = w - lr * gradient(w);
    setW(next);
    setHistory((h) => [...h, next]);
  }

  function reset() {
    setW(START_W);
    setHistory([START_W]);
  }

  return (
    <div className="not-prose my-6 rounded-lg border border-fd-border bg-fd-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm text-fd-muted-foreground">
          learning rate = {lr.toFixed(2)}
          <input
            type="range"
            min={0.01}
            max={1.1}
            step={0.01}
            value={lr}
            onChange={(e) => {
              setLr(Number(e.target.value));
              reset();
            }}
            className="w-40"
          />
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-fd-muted-foreground">
            step {history.length - 1} · loss {diverged ? "∞" : currentLoss.toFixed(2)}
          </span>
          <Button size="sm" onClick={step} disabled={diverged}>
            Step
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-lg rounded-md border border-fd-border bg-fd-background">
        <polyline points={CURVE_POINTS} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth={2} />
        <line
          x1={toSvgX(TARGET_W)}
          y1={PAD}
          x2={toSvgX(TARGET_W)}
          y2={HEIGHT - PAD}
          stroke="#10b981"
          strokeDasharray="4 4"
          strokeOpacity={0.6}
        />
        {trailPoints.length > 1 && (
          <polyline points={trailPoints.join(" ")} fill="none" stroke="#6366f1" strokeOpacity={0.4} strokeWidth={1.5} />
        )}
        {!diverged && (
          <circle cx={toSvgX(Math.max(-2, Math.min(12, w)))} cy={toSvgY(Math.min(40, currentLoss))} r={7} fill="#6366f1" stroke="white" strokeWidth={2} />
        )}
      </svg>
      <p className="mt-2 text-xs text-fd-muted-foreground">
        The dashed green line marks the true minimum. Click &quot;Step&quot; to take one gradient descent update —
        watch the point roll toward the minimum with a small learning rate, oscillate with a moderate one, or fly
        off the curve entirely (try 1.05+) once the learning rate is too large to converge.
      </p>
    </div>
  );
}
