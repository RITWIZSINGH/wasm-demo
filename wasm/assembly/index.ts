// wasm/assembly/index.ts
//@ts-nocheck
// Embedded in WASM binary (demo only)
const SECRET = "demo_secret_not_in_app_js";

// Export an allocator so JS doesn't guess runtime IDs
export function alloc(len: i32): usize {
  return __new(len, idof<ArrayBuffer>());
}

// Simple demo hash (not crypto; just for showing "computed in WASM")
function hashBytes(bytes: Uint8Array): u32 {
  let h: u32 = 2166136261;
  for (let i = 0; i < bytes.length; i++) {
    h ^= <u32>bytes[i];
    h = (h * 16777619) as u32;
  }
  return h;
}

// Write a null-terminated UTF8 string into WASM memory and return pointer
function writeCString(s: string): usize {
  const buf = String.UTF8.encode(s, true); // null-terminated
  const arr = Uint8Array.wrap(changetype<ArrayBuffer>(buf));

  const outPtr = alloc(arr.length);
  memory.copy(outPtr, changetype<usize>(arr.buffer), arr.length);
  return outPtr;
}

// Exported raw API: ptr+len inputs, returns ptr to C-string output
export function get_signature_raw(
  methodPtr: usize, methodLen: i32,
  pathPtr: usize, pathLen: i32,
  timePtr: usize, timeLen: i32,
  noncePtr: usize, nonceLen: i32
): usize {
  const method = String.UTF8.decodeUnsafe(methodPtr, methodLen, true);
  const path = String.UTF8.decodeUnsafe(pathPtr, pathLen, true);
  const ts = String.UTF8.decodeUnsafe(timePtr, timeLen, true);
  const nonce = String.UTF8.decodeUnsafe(noncePtr, nonceLen, true);

  const canonical = method + "\n" + path + "\n" + ts + "\n" + nonce;

  const secretBuf = String.UTF8.encode(SECRET);
  const msgBuf = String.UTF8.encode(canonical);

  const sArr = Uint8Array.wrap(changetype<ArrayBuffer>(secretBuf));
  const mArr = Uint8Array.wrap(changetype<ArrayBuffer>(msgBuf));

  const combined = new Uint8Array(sArr.length + mArr.length);
  for (let i = 0; i < sArr.length; i++) combined[i] = sArr[i];
  for (let j = 0; j < mArr.length; j++) combined[sArr.length + j] = mArr[j];

  const h = hashBytes(combined);
  const out = "WASM_SIG_" + h.toString();

  return writeCString(out);
}
