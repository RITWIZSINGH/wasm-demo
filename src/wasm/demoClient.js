// src/wasm/demoClient.js
let worker = null;
let counter = 0;

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./demo.worker.js", import.meta.url));
  return worker;
}

function callWorker(type, payload) {
  const w = getWorker();
  const id = String(++counter);

  return new Promise((resolve, reject) => {
    const onMsg = (e) => {
      if (e.data?.id !== id) return;
      w.removeEventListener("message", onMsg);
      if (e.data.ok) resolve(e.data.result);
      else reject(new Error(e.data.error || "Worker error"));
    };

    w.addEventListener("message", onMsg);
    w.postMessage({ id, type, payload });
  });
}

export function wasmSign(payload) {
  return callWorker("sign", payload);
}
