// Small helpers shared by every module. No DOM access here, so tests can import it.

export function esc(s = "") {
  return String(s ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
export function uuid() {
  return globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
export function pick(a, rng = Math.random) { return a[Math.floor(rng() * a.length)]; }
export function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
export function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
export function readJSON(key, fallback) {
  try { const v = JSON.parse(globalThis.localStorage?.getItem(key) ?? "null"); return v ?? fallback; } catch { return fallback; }
}
export function writeJSON(key, value) {
  try { globalThis.localStorage?.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
