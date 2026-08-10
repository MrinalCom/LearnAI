"use client";

import { useMemo, useState } from "react";

const INPUT_COUNT = 3;
const HIDDEN_COUNT = 4;
const OUTPUT_COUNT = 2;

const WIDTH = 420;
const HEIGHT = 260;
const LAYER_X = [60, 210, 360];

// Deterministic PRNG (mulberry32) so weights are identical on server and client renders.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomWeights(rows: number, cols: number, rand: () => number) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rand() - 0.5) * 3));
}

const rand = mulberry32(11);
const W1 = randomWeights(INPUT_COUNT, HIDDEN_COUNT, rand);
const B1 = Array.from({ length: HIDDEN_COUNT }, () => (rand() - 0.5) * 0.5);
const W2 = randomWeights(HIDDEN_COUNT, OUTPUT_COUNT, rand);
const B2 = Array.from({ length: OUTPUT_COUNT }, () => (rand() - 0.5) * 0.5);

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function nodeY(index: number, count: number) {
  const spacing = HEIGHT / (count + 1);
  return spacing * (index + 1);
}

function activationColor(value: number) {
  // 0 -> fd-background-ish, 1 -> indigo.
  const t = Math.max(0, Math.min(1, value));
  const r = Math.round(255 - t * (255 - 99));
  const g = Math.round(255 - t * (255 - 102));
  const b = Math.round(255 - t * (255 - 241));
  return `rgb(${r}, ${g}, ${b})`;
}

export function NeuralNetworkVisualizer() {
  const [inputs, setInputs] = useState([0.5, -0.3, 0.8]);

  const { hidden, outputs } = useMemo(() => {
    const hidden = Array.from({ length: HIDDEN_COUNT }, (_, j) => {
      const sum = inputs.reduce((acc, x, i) => acc + x * W1[i][j], B1[j]);
      return sigmoid(sum);
    });
    const outputs = Array.from({ length: OUTPUT_COUNT }, (_, k) => {
      const sum = hidden.reduce((acc, h, j) => acc + h * W2[j][k], B2[k]);
      return sigmoid(sum);
    });
    return { hidden, outputs };
  }, [inputs]);

  const predicted = outputs[0] > outputs[1] ? 0 : 1;

  return (
    <div className="not-prose my-6 rounded-lg border border-fd-border bg-fd-card p-4">
      <div className="mb-3 grid grid-cols-3 gap-3">
        {inputs.map((value, i) => (
          <label key={i} className="flex flex-col gap-1 text-xs text-fd-muted-foreground">
            x{i + 1} = {value.toFixed(2)}
            <input
              type="range"
              min={-2}
              max={2}
              step={0.05}
              value={value}
              onChange={(e) =>
                setInputs((prev) => prev.map((v, idx) => (idx === i ? Number(e.target.value) : v)))
              }
            />
          </label>
        ))}
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-lg rounded-md border border-fd-border bg-fd-background">
        {/* input -> hidden edges */}
        {inputs.map((_, i) =>
          W1[i].map((w, j) => (
            <line
              key={`ih-${i}-${j}`}
              x1={LAYER_X[0]}
              y1={nodeY(i, INPUT_COUNT)}
              x2={LAYER_X[1]}
              y2={nodeY(j, HIDDEN_COUNT)}
              stroke={w >= 0 ? "#6366f1" : "#f59e0b"}
              strokeOpacity={Math.min(0.9, Math.abs(w) / 1.5)}
              strokeWidth={1}
            />
          )),
        )}
        {/* hidden -> output edges */}
        {hidden.map((_, j) =>
          W2[j].map((w, k) => (
            <line
              key={`ho-${j}-${k}`}
              x1={LAYER_X[1]}
              y1={nodeY(j, HIDDEN_COUNT)}
              x2={LAYER_X[2]}
              y2={nodeY(k, OUTPUT_COUNT)}
              stroke={w >= 0 ? "#6366f1" : "#f59e0b"}
              strokeOpacity={Math.min(0.9, Math.abs(w) / 1.5)}
              strokeWidth={1}
            />
          )),
        )}

        {/* input nodes */}
        {inputs.map((value, i) => (
          <g key={`in-${i}`}>
            <circle cx={LAYER_X[0]} cy={nodeY(i, INPUT_COUNT)} r={16} fill={activationColor((value + 2) / 4)} stroke="currentColor" strokeOpacity={0.4} />
            <text x={LAYER_X[0]} y={nodeY(i, INPUT_COUNT) + 4} textAnchor="middle" fontSize={10} fontFamily="monospace">
              {value.toFixed(1)}
            </text>
          </g>
        ))}

        {/* hidden nodes */}
        {hidden.map((value, j) => (
          <g key={`hn-${j}`}>
            <circle cx={LAYER_X[1]} cy={nodeY(j, HIDDEN_COUNT)} r={16} fill={activationColor(value)} stroke="currentColor" strokeOpacity={0.4} />
            <text x={LAYER_X[1]} y={nodeY(j, HIDDEN_COUNT) + 4} textAnchor="middle" fontSize={10} fontFamily="monospace">
              {value.toFixed(2)}
            </text>
          </g>
        ))}

        {/* output nodes */}
        {outputs.map((value, k) => (
          <g key={`on-${k}`}>
            <circle
              cx={LAYER_X[2]}
              cy={nodeY(k, OUTPUT_COUNT)}
              r={18}
              fill={activationColor(value)}
              stroke={predicted === k ? "#6366f1" : "currentColor"}
              strokeWidth={predicted === k ? 3 : 1}
              strokeOpacity={predicted === k ? 1 : 0.4}
            />
            <text x={LAYER_X[2]} y={nodeY(k, OUTPUT_COUNT) + 4} textAnchor="middle" fontSize={10} fontFamily="monospace">
              {value.toFixed(2)}
            </text>
            <text x={LAYER_X[2]} y={nodeY(k, OUTPUT_COUNT) + 32} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>
              class {k}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-xs text-fd-muted-foreground">
        Drag the input sliders and watch activations flow forward through the network in real time. Edge color
        shows weight sign (indigo = positive, amber = negative); node fill shows activation strength. The
        highlighted output is the network&apos;s current prediction — with fixed, untrained weights, so don&apos;t
        read anything into which class it currently favors.
      </p>
    </div>
  );
}
