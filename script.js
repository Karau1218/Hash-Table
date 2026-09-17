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

async function showLiveHash() {
  if (!pyodideInstance) return;
  const key = document.getElementById("inputKey").value;
  if (!key) {
    document.getElementById("hashPreview").innerText = "Hash: -";
    return;
  }

  const breakdown = await pyodideInstance.runPythonAsync(`get_hash_breakdown("${key}")`);
  const data = breakdown.toJs();
  breakdown.destroy();

  document.getElementById("hashPreview").innerText =
    `Hash: ${data.get("hash")} (${data.get("formula")})`;
}

async function handleAdd() {
  const k = document.getElementById("inputKey").value.trim();
  const v = document.getElementById("inputValue").value.trim();
  if (!k || !v) return setStatus("Enter both key and value", true);

  await pyodideInstance.runPythonAsync(`ht.add("${k}", "${v}")`);
  setStatus(`Added pair: "${k}" -> "${v}"`);
  renderBuckets();
}

