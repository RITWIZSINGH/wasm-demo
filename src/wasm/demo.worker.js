// src/wasm/demo.worker.js

let wasmInstance = null;

async function loadWasm() {
    if (wasmInstance) return wasmInstance;

    console.log("[Worker] Fetching /demo.wasm ...");
    const res = await fetch("/demo.wasm");
    const bytes = await res.arrayBuffer();

    console.log("[Worker] Instantiating WASM...");

    // ✅ Provide required AssemblyScript imports
    const imports = {
        env: {
            abort(msgPtr, filePtr, line, col) {
                // optional: you can decode msg/file if you want later
                throw new Error(`WASM abort at ${line}:${col}`);
            },
            trace() { },
            seed() {
                return (Date.now() >>> 0);
            },
        },
    };

    const { instance } = await WebAssembly.instantiate(bytes, imports);
    wasmInstance = instance;

    console.log("[Worker] WASM ready ✅. Exports:", Object.keys(instance.exports));
    return wasmInstance;
}

// Write a JS string into WASM memory using WASM's exported alloc()
function writeUtf8(exports, str) {
    //this part converts string to utf8 and allocates memory in wasm
    const enc = new TextEncoder().encode(str);
    const ptr = exports.alloc(enc.length);
    const mem = new Uint8Array(exports.memory.buffer, ptr, enc.length);
    mem.set(enc);
    return { ptr, len: enc.length };
}

// Read a null-terminated UTF8 string from WASM memory
function readCString(exports, ptr) {
    const mem = new Uint8Array(exports.memory.buffer);
    let end = ptr;
    while (mem[end] !== 0) end++;
    return new TextDecoder().decode(mem.slice(ptr, end));
}

self.onmessage = async (e) => {
    const { id, type, payload } = e.data;

    try {
        const inst = await loadWasm();
        const ex = inst.exports;

        if (type === "sign") {
            const { method, path, timestamp, nonce } = payload;

            const m = writeUtf8(ex, method);
            const p = writeUtf8(ex, path);
            const t = writeUtf8(ex, timestamp);
            const n = writeUtf8(ex, nonce);

            const sigPtr = ex.get_signature_raw(
                m.ptr, m.len,
                p.ptr, p.len,
                t.ptr, t.len,
                n.ptr, n.len
            );

            const sig = readCString(ex, sigPtr);
            self.postMessage({ id, ok: true, result: sig });
            return;
        }

        self.postMessage({ id, ok: false, error: "Unknown message type" });
    } catch (err) {
        self.postMessage({ id, ok: false, error: String(err?.message || err) });
    }
};
