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

async function handleLookup() {
  const k = document.getElementById("inputKey").value.trim();
  if (!k) return setStatus("Enter key to search", true);

  const res = await pyodideInstance.runPythonAsync(`ht.lookup("${k}")`);
  if (res === null) {
    setStatus(`Key "${k}" not found (None)`, true);
  } else {
    setStatus(`Found "${k}": "${res}"`);
    document.getElementById("inputValue").value = res;
  }
}

async function handleRemove() {
  const k = document.getElementById("inputKey").value.trim();
  if (!k) return setStatus("Enter key to remove", true);

  await pyodideInstance.runPythonAsync(`ht.remove("${k}")`);
  setStatus(`Removed key: "${k}"`);
  renderBuckets();
}

async function renderBuckets() {
  const rawJson = await pyodideInstance.runPythonAsync("get_table_state_json()");
  const collection = JSON.parse(rawJson);
  const container = document.getElementById("bucketContainer");
  container.innerHTML = "";

  const hashes = Object.keys(collection);
  if (hashes.length === 0) {
    container.innerHTML = '<div style="color: #64748b; font-size: 13px;">Hash table is empty.</div>';
    return;
  }

  hashes.forEach((hashVal) => {
    const bucketCard = document.createElement("div");
    bucketCard.className = "bucket-card";

    const bucketItems = collection[hashVal];
    const isCollision = Object.keys(bucketItems).length > 1;

    let itemsHtml = "";
    for (const [k, v] of Object.entries(bucketItems)) {
      itemsHtml += `
        <span class="kv-pair">
          <span class="kv-key">${escapeHtml(k)}</span>: 
          <span class="kv-val">${escapeHtml(String(v))}</span>
        </span>
      `;
    }

    bucketCard.innerHTML = `
      <div class="bucket-header">
        Bucket [${hashVal}] ${isCollision ? '<span style="color: #f87171;">(Collision Detected)</span>' : ""}
      </div>
      <div class="bucket-items">${itemsHtml}</div>
    `;

    container.appendChild(bucketCard);
  });
}

async function loadCollisionExample() {
  // "cat", "act", and "tac" all sum to: 99 + 97 + 116 = 312
  await pyodideInstance.runPythonAsync(`
ht.add("cat", "feline")
ht.add("act", "theater")
ht.add("tac", "tic-tac-toe")
ht.add("dog", "canine")
  `);
  setStatus("Loaded demo: 'cat', 'act', and 'tac' share bucket 312");
  renderBuckets();
}

function setStatus(msg, isError = false) {
  const el = document.getElementById("status");
  el.innerText = msg;
  el.style.color = isError ? "#f87171" : "#38bdf8";
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}