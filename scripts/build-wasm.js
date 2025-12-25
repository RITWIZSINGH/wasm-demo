// scripts/build-wasm.js
const { execFileSync } = require("child_process");
const path = require("path");

const entry = path.resolve("wasm", "assembly", "index.ts");
const outFile = path.resolve("public", "demo.wasm");

execFileSync(
  "cmd.exe",
  [
    "/c",
    "npx",
    "asc",
    entry,
    "--outFile",
    outFile,
    "--runtime",
    "stub",
    "--exportRuntime",
    "-O3",
  ],
  { stdio: "inherit" }
);

console.log("✅ Built:", outFile);
