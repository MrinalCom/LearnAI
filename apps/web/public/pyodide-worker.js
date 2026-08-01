importScripts("https://cdn.jsdelivr.net/pyodide/v314.0.3/full/pyodide.js");

const pyodideReadyPromise = loadPyodide().then(async (pyodide) => {
  await pyodide.loadPackage(["numpy", "scikit-learn"]);
  return pyodide;
});

pyodideReadyPromise.then(
  () => self.postMessage({ status: "ready" }),
  (err) => self.postMessage({ status: "error", output: String(err) }),
);

self.onmessage = async (event) => {
  const { id, code } = event.data;
  const pyodide = await pyodideReadyPromise;

  let output = "";
  pyodide.setStdout({ batched: (s) => (output += s + "\n") });
  pyodide.setStderr({ batched: (s) => (output += s + "\n") });

  try {
    const result = await pyodide.runPythonAsync(code);
    if (result !== undefined && result !== null) output += String(result);
    self.postMessage({ id, status: "success", output });
  } catch (err) {
    self.postMessage({ id, status: "error", output: output + String(err) });
  }
};
