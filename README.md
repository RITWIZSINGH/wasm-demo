# JS vs WebAssembly Signature Demo (Wallet-Style Execution)

## Overview

This project is a **learning and demonstration repository** created to understand how **WebAssembly (WASM)** can be used to harden client-side cryptographic logic compared to plain JavaScript.

It replicates the **execution pattern used by modern web wallets**:

```
Main JS Thread → Web Worker → WebAssembly → Web Worker → Main JS
```

The demo intentionally shows **two approaches side by side**:

- **JavaScript signature generation** (baseline, easy to inspect)
- **WebAssembly signature generation** (compiled, worker-isolated)

The goal is **not** to claim perfect secrecy, but to demonstrate how WASM **raises the cost and effort of client-side attacks**.

---

## What This Demo Shows

### JavaScript Signature (Baseline)
- Logic runs directly in application JavaScript
- Secret and algorithm are readable in DevTools
- Easy to copy, modify, or reproduce

### WebAssembly Signature (Wallet-Style)
- Logic compiled into a `.wasm` binary
- Executed inside a Web Worker
- Inputs written into WASM memory
- Signature computed in compiled code
- Output read back from WASM memory

This mirrors how **real web wallets and secure browser extensions** execute sensitive logic.

---

## Demo UI

The UI contains two buttons:

- **Run JS Signature**
- **Run WASM Signature**

Both use the **same inputs**:
- HTTP method
- API path
- Timestamp
- Nonce (one-time random value)

The difference is **where and how the signature is computed**.

---

## What Is a "Signature" in This Demo?

A signature is a short proof string derived from request data.

### Canonical string format:
```
METHOD
/PATH
TIMESTAMP
NONCE
```

Example:
```
POST
/api/demo
1700000000
550e8400-e29b-41d4-a716-446655440000
```

This canonical string is combined with a **secret** and hashed to produce a signature.

> **Note:**  
> For clarity and education, this demo uses a simple hash.  
> In production systems, this would typically be **HMAC-SHA256** or similar.

---

## Execution Flow

### JavaScript Path
```
App.vue
→ jsSign()
→ compute hash in JS
→ return signature
```

### WebAssembly Path
```
App.vue
→ demoClient.js
→ demo.worker.js
→ load demo.wasm
→ write inputs into WASM memory
→ call WASM function
→ read signature from WASM memory
→ return result
```

---

## File Structure

```
src/
  App.vue                    # UI + JS signature
  wasm/
    demoClient.js             # Promise-based worker interface
    demo.worker.js            # JS ↔ WASM bridge (wallet-style)

wasm/
  assembly/
    index.ts                  # AssemblyScript → compiled to WASM

scripts/
  build-wasm.js               # Cross-platform WASM build script

public/
  demo.wasm                   # Compiled WebAssembly binary
```

---

## Key Files Explained

### `App.vue`
- Demonstrates **JS vs WASM** side by side
- Generates nonce and timestamp
- Shows signatures in console and UI

### `demoClient.js`
- Abstracts Worker communication
- Makes WASM execution feel like a normal async function

### `demo.worker.js`
- Loads `demo.wasm`
- Allocates memory inside WASM
- Writes input strings as UTF-8
- Calls exported WASM function
- Reads output from WASM memory

### `wasm/assembly/index.ts`
- Written in **AssemblyScript**
- Compiled into `.wasm`
- Contains the embedded secret
- Reconstructs canonical string
- Computes signature
- Writes output into WASM memory

---

## Observing the Demo in DevTools

### Console
- Shows JS execution vs Worker + WASM execution
- Clearly separates main thread and worker logs

### Network
- Displays `demo.wasm` being fetched as a binary asset
- Confirms that compiled code is executed by the browser

### Sources
- JS signature secret is visible in application code
- WASM secret is **not present** in JS sources

---

## Security Model (Honest & Realistic)

### What This Protects Against
- Casual inspection
- Script-based API abuse
- Signature cloning via copy-paste
- Easy tampering in DevTools

### What This Does NOT Protect Against
- Determined reverse engineering
- Fully compromised client devices
- Nation-state level attackers

> WebAssembly is **not encryption**.  
> It is **compiled, non-semantic code** that raises attack difficulty.

---

## Why This Pattern Is Used by Web Wallets

Web wallets use this pattern to:
- Increase reverse-engineering cost
- Prevent scalable client-side abuse
- Isolate sensitive logic from UI code
- Combine with server-side validation (nonce + timestamp)

When paired with:
- Short-lived secrets
- Server verification
- Rate limiting

…it becomes **practical, real-world client security**.

---

## Key Takeaway

> JavaScript makes attacks easy to scale.  
> WebAssembly makes attacks expensive, manual, and short-lived.

This project demonstrates **why that difference matters**.

---

## Disclaimer

This repository is **educational**.

- Do not use this demo code directly in production
- Cryptographic primitives are simplified for clarity
- Always combine client-side protections with server-side enforcement

---

## License

MIT — for learning and experimentation.