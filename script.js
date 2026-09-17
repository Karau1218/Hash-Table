let pyodideInstance = null;

async function initPython() {
  const statusEl = document.getElementById("status");
  try {
    statusEl.innerText = "Loading Pyodide WebAssembly...";
    pyodideInstance = await loadPyodide();

    const response = await fetch("main.py");
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const pyCode = await response.text();
    await pyodideInstance.runPythonAsync(pyCode);

    statusEl.innerText = "Python HashTable ready.";
    statusEl.style.color = "#4ade80";

    renderBuckets();
  } catch (err) {
    statusEl.innerText = "Init Error: " + err.message;
    statusEl.style.color = "#f87171";
    console.error(err);
  }
}

initPython();

