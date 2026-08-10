"use client";

import { useMemo, useState } from "react";

type Cluster = "animals" | "fruits" | "tech" | "emotions";

interface WordPoint {
  word: string;
  x: number;
  y: number;
  cluster: Cluster;
}

const WIDTH = 420;
const HEIGHT = 300;

// Hand-placed 2D coordinates illustrating that semantically related words end up
// near each other in embedding space — a real embedding model has hundreds of
// dimensions, this is a simplified 2D stand-in for teaching the concept.
const WORDS: WordPoint[] = [
  { word: "cat", x: 60, y: 60, cluster: "animals" },
  { word: "dog", x: 90, y: 75, cluster: "animals" },
  { word: "lion", x: 55, y: 100, cluster: "animals" },
  { word: "tiger", x: 85, y: 110, cluster: "animals" },
  { word: "puppy", x: 100, y: 55, cluster: "animals" },
  { word: "apple", x: 260, y: 55, cluster: "fruits" },
  { word: "banana", x: 290, y: 75, cluster: "fruits" },
  { word: "orange", x: 250, y: 90, cluster: "fruits" },
  { word: "grape", x: 280, y: 45, cluster: "fruits" },
  { word: "computer", x: 320, y: 210, cluster: "tech" },
  { word: "software", x: 350, y: 230, cluster: "tech" },
  { word: "algorithm", x: 300, y: 250, cluster: "tech" },
  { word: "data", x: 335, y: 190, cluster: "tech" },
  { word: "happy", x: 90, y: 230, cluster: "emotions" },
  { word: "sad", x: 65, y: 255, cluster: "emotions" },
  { word: "excited", x: 110, y: 210, cluster: "emotions" },
  { word: "angry", x: 55, y: 280, cluster: "emotions" },
];

const CLUSTER_COLOR: Record<Cluster, string> = {
  animals: "#6366f1",
  fruits: "#f59e0b",
  tech: "#10b981",
  emotions: "#ef4444",
};

function distance(a: WordPoint, b: WordPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function EmbeddingSpaceVisualizer() {
  const [selected, setSelected] = useState<string>("cat");
  const [k, setK] = useState(3);

  const neighbors = useMemo(() => {
    const target = WORDS.find((w) => w.word === selected)!;
    return [...WORDS]
      .filter((w) => w.word !== selected)
      .sort((a, b) => distance(target, a) - distance(target, b))
      .slice(0, k);
  }, [selected, k]);

  const target = WORDS.find((w) => w.word === selected)!;

  return (
    <div className="not-prose my-6 rounded-lg border border-fd-border bg-fd-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm text-fd-muted-foreground">
          nearest neighbors: k = {k}
          <input type="range" min={1} max={6} value={k} onChange={(e) => setK(Number(e.target.value))} className="w-32" />
        </label>
        <span className="text-xs text-fd-muted-foreground">Click any word to select it</span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full max-w-lg rounded-md border border-fd-border bg-fd-background"
      >
        {neighbors.map((n) => (
          <line
            key={n.word}
            x1={target.x}
            y1={target.y}
            x2={n.x}
            y2={n.y}
            stroke={CLUSTER_COLOR[target.cluster]}
            strokeOpacity={0.5}
            strokeWidth={1.5}
          />
        ))}
        {WORDS.map((w) => {
          const isSelected = w.word === selected;
          const isNeighbor = neighbors.some((n) => n.word === w.word);
          return (
            <g
              key={w.word}
              onClick={() => setSelected(w.word)}
              className="cursor-pointer"
              style={{ pointerEvents: "all" }}
            >
              <circle
                cx={w.x}
                cy={w.y}
                r={isSelected ? 8 : isNeighbor ? 6 : 4}
                fill={CLUSTER_COLOR[w.cluster]}
                stroke={isSelected ? "currentColor" : "white"}
                strokeWidth={isSelected ? 2 : 1}
              />
              <text x={w.x + 10} y={w.y + 4} fontSize={11} fill="currentColor" opacity={isSelected || isNeighbor ? 1 : 0.6}>
                {w.word}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-xs text-fd-muted-foreground">
        A simplified 2D stand-in for a real embedding space (real models use hundreds of dimensions). Notice
        semantically related words — animals, fruits, tech terms, emotions — cluster together, exactly the property
        that makes embeddings useful for search and retrieval.
      </p>
    </div>
  );
}
