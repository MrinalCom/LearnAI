"use client";

import { useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { Button } from "@/components/ui/button";

type Status = "loading" | "ready" | "running" | "error";

interface PyodidePlaygroundProps {
  initialCode: string;
}

export function PyodidePlayground({ initialCode }: PyodidePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("loading");
  const workerRef = useRef<Worker | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    const worker = new Worker("/pyodide-worker.js");
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<{ id?: number; status: Status; output?: string }>) => {
      const { id, status: msgStatus, output: msgOutput } = event.data;
      if (msgStatus === "ready") {
        setStatus("ready");
        return;
      }
      if (id !== undefined && id !== runIdRef.current) return; // stale response from a previous run
      setStatus(msgStatus === "error" ? "error" : "ready");
      setOutput(msgOutput ?? "");
    };

    worker.onerror = (event) => {
      setStatus("error");
      setOutput(`Worker failed to load: ${event.message}`);
    };

    return () => worker.terminate();
  }, []);

  function runCode() {
    if (!workerRef.current || status === "loading" || status === "running") return;
    runIdRef.current += 1;
    setStatus("running");
    setOutput("");
    workerRef.current.postMessage({ id: runIdRef.current, code });
  }

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex items-center justify-between border-b border-fd-border px-4 py-2">
        <span className="text-xs font-medium text-fd-muted-foreground">Python (Pyodide + scikit-learn)</span>
        <Button size="sm" onClick={runCode} disabled={status === "loading" || status === "running"}>
          {status === "loading" ? "Loading Python…" : status === "running" ? "Running…" : "Run"}
        </Button>
      </div>
      <CodeMirror
        value={code}
        onChange={setCode}
        theme={vscodeDark}
        extensions={[python()]}
        basicSetup={{ lineNumbers: true, foldGutter: false }}
        style={{ fontSize: 13 }}
      />
      {output && (
        <pre className="max-h-64 overflow-auto border-t border-fd-border bg-fd-background px-4 py-3 text-xs">
          {output}
        </pre>
      )}
    </div>
  );
}
