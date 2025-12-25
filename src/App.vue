<template>
  <div style="font-family: system-ui; padding: 24px; max-width: 900px">
    <h1>JS vs WASM (Wallet-Style Demo)</h1>

    <p style="opacity: 0.8">
      This demo computes a “signature” two ways:
      <br />1) Normal JavaScript (secret visible in source) <br />2) WebAssembly
      via Web Worker (secret embedded in .wasm)
    </p>

    <div style="display: flex; gap: 12px; margin: 16px 0">
      <button @click="runJs">Run JS signature</button>
      <button @click="runWasm">Run WASM signature (Worker → WASM)</button>
    </div>

    <div style="margin-top: 18px">
      <h3>Inputs</h3>
      <pre>{{ payload }}</pre>

      <h3>Outputs</h3>
      <p><b>JS:</b> {{ jsSig }}</p>
      <p><b>WASM:</b> {{ wasmSig }}</p>
    </div>

    <hr style="margin: 22px 0" />

    
  </div>
</template>

<script>
import { wasmSign } from "./wasm/demoClient";

export default {
  data() {
    return {
      payload: {
        method: "POST",
        path: "/api/demo",
        timestamp: String(Math.floor(Date.now() / 1000)),
        nonce: crypto.randomUUID(),
      },
      jsSig: "",
      wasmSig: "",
    };
  },
  methods: {
    jsSign({ method, path, timestamp, nonce }) {
      const SECRET = "secret1234asaduajsnc"; 
      const canonical = `${method}\n${path}\n${timestamp}\n${nonce}`;
      // tiny demo hash:
      let h = 2166136261;
      //string
      const s = SECRET + canonical;
      //demo hash function
      for (let i = 0; i < s.length; i++) {
        //h is updated
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return "JS_SIG_" + (h >>> 0).toString();
    },

    runJs() {
      console.log("[Main] Running JS signature...");
      this.jsSig = this.jsSign(this.payload);
      console.log("[Main] JS signature:", this.jsSig);
    },

    async runWasm() {
      console.log("[Main] Running WASM signature...");

      const payload = {
        method: this.payload.method,
        path: this.payload.path,
        timestamp: this.payload.timestamp,
        nonce: this.payload.nonce,
      };

      this.wasmSig = await wasmSign(payload);
      console.log("[Main] WASM signature:", this.wasmSig);
    },
  },
};
</script>
