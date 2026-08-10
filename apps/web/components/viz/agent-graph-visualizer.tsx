"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NodeId = "start" | "agent" | "tool_search" | "tool_calculator" | "end";

interface Step {
  activeNode: NodeId;
  activeEdge?: [NodeId, NodeId];
  speaker: string;
  message: string;
}

const STEPS: Step[] = [
  { activeNode: "start", speaker: "User", message: "What's the population of France, divided by 2?" },
  {
    activeNode: "agent",
    activeEdge: ["start", "agent"],
    speaker: "Agent",
    message: "I need France's population first, then a calculation. Calling the search tool.",
  },
  {
    activeNode: "tool_search",
    activeEdge: ["agent", "tool_search"],
    speaker: "Tool: search",
    message: 'query="population of France" -> result: 68,000,000',
  },
  {
    activeNode: "agent",
    activeEdge: ["tool_search", "agent"],
    speaker: "Agent",
    message: "Got the population. Now I'll call the calculator tool to divide it by 2.",
  },
  {
    activeNode: "tool_calculator",
    activeEdge: ["agent", "tool_calculator"],
    speaker: "Tool: calculator",
    message: "68000000 / 2 -> result: 34,000,000",
  },
  {
    activeNode: "agent",
    activeEdge: ["tool_calculator", "agent"],
    speaker: "Agent",
    message: "I have everything I need to answer.",
  },
  {
    activeNode: "end",
    activeEdge: ["agent", "end"],
    speaker: "Agent",
    message: "France's population is about 68 million, so divided by 2 that's 34 million.",
  },
];

const NODE_LABELS: Record<NodeId, string> = {
  start: "START",
  agent: "agent\n(LLM)",
  tool_search: "tool:\nsearch",
  tool_calculator: "tool:\ncalculator",
  end: "END",
};

// Fixed layout in a 400x260 canvas.
const NODE_POS: Record<NodeId, { x: number; y: number }> = {
  start: { x: 60, y: 130 },
  agent: { x: 200, y: 130 },
  tool_search: { x: 330, y: 60 },
  tool_calculator: { x: 330, y: 200 },
  end: { x: 200, y: 240 },
};

const EDGES: [NodeId, NodeId][] = [
  ["start", "agent"],
  ["agent", "tool_search"],
  ["tool_search", "agent"],
  ["agent", "tool_calculator"],
  ["tool_calculator", "agent"],
  ["agent", "end"],
];

function edgeKey(edge: [NodeId, NodeId]) {
  return edge.join("->");
}

export function AgentGraphVisualizer() {
  const [stepIndex, setStepIndex] = useState(-1);

  const current = stepIndex >= 0 ? STEPS[stepIndex] : null;
  const visibleLog = STEPS.slice(0, stepIndex + 1);

  function next() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function reset() {
    setStepIndex(-1);
  }

  return (
    <div className="not-prose my-6 rounded-lg border border-fd-border bg-fd-card p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-fd-muted-foreground">
          Scripted walkthrough — not a live model call
        </span>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={next} disabled={stepIndex >= STEPS.length - 1}>
            {stepIndex === -1 ? "Start" : "Next step"}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>

      <svg viewBox="0 0 400 260" className="w-full max-w-lg rounded-md border border-fd-border bg-fd-background">
        {EDGES.map((edge) => {
          const [a, b] = edge;
          const active = current?.activeEdge && edgeKey(current.activeEdge) === edgeKey(edge);
          return (
            <line
              key={edgeKey(edge)}
              x1={NODE_POS[a].x}
              y1={NODE_POS[a].y}
              x2={NODE_POS[b].x}
              y2={NODE_POS[b].y}
              stroke={active ? "#6366f1" : "currentColor"}
              strokeOpacity={active ? 1 : 0.2}
              strokeWidth={active ? 2.5 : 1.5}
            />
          );
        })}
        {(Object.keys(NODE_POS) as NodeId[]).map((id) => {
          const pos = NODE_POS[id];
          const active = current?.activeNode === id;
          const visited = visibleLog.some((s) => s.activeNode === id);
          return (
            <g key={id}>
              <rect
                x={pos.x - 34}
                y={pos.y - 18}
                width={68}
                height={36}
                rx={8}
                fill={active ? "#6366f1" : visited ? "color-mix(in oklch, #6366f1 20%, transparent)" : "transparent"}
                stroke={active ? "#6366f1" : "currentColor"}
                strokeOpacity={active ? 1 : 0.4}
                strokeWidth={active ? 2 : 1}
              />
              {NODE_LABELS[id].split("\n").map((line, i, arr) => (
                <text
                  key={i}
                  x={pos.x}
                  y={pos.y + (i - (arr.length - 1) / 2) * 12 + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fill={active ? "white" : "currentColor"}
                  fontFamily="monospace"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex max-h-48 flex-col gap-2 overflow-y-auto rounded-md border border-fd-border bg-fd-background p-3">
        {visibleLog.length === 0 && (
          <p className="text-xs text-fd-muted-foreground">Click &quot;Start&quot; to begin the walkthrough.</p>
        )}
        {visibleLog.map((step, i) => (
          <p key={i} className="text-xs">
            <span className={cn("font-semibold", step.speaker === "User" ? "text-fd-foreground" : "text-fd-primary")}>
              {step.speaker}:
            </span>{" "}
            <span className="text-fd-muted-foreground">{step.message}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
