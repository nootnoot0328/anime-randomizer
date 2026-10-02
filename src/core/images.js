// Portrait URLs and the optional offline cache (IndexedDB "AnimeFusionDB", same as v0.6.x,
// so portraits people already saved keep working).
import { STATE } from "./state.js";
import { app } from "./app.js";

const OBJECT_URLS = new Map(), PENDING = new Set();
// URLs that failed to load this session: shown as initials instead of a broken image
const FAILED = new Set();
export function markImageFailed(url) { if (url && !FAILED.has(url)) { FAILED.add(url); app.render(); } }
let DB_PROMISE = null;

export function openDB() {
  if (DB_PROMISE) return DB_PROMISE;
  DB_PROMISE = new Promise((resolve, reject) => {
    const req = indexedDB.open("AnimeFusionDB", 3);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (db.objectStoreNames.contains("state")) db.deleteObjectStore("state");
      if (!db.objectStoreNames.contains("images")) db.createObjectStore("images");
    };
    req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
  });
  return DB_PROMISE;
}
const store = mode => openDB().then(db => db.transaction("images", mode).objectStore("images"));
const done = req => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });
export async function imageGet(key) { return (await done((await store("readonly")).get(key))) || null; }
export async function imagePut(key, blob) { return done((await store("readwrite")).put(blob, key)); }
export async function imageDelete(key) { return done((await store("readwrite")).delete(key)); }
export async function imageKeys() { return (await done((await store("readonly")).getAllKeys())) || []; }
export async function purgeLegacyPackImages() { for (const k of (await imageKeys()).filter(k => String(k).startsWith("pack:"))) await imageDelete(k); }

function revoke(key) { const u = OBJECT_URLS.get(key); if (u) { URL.revokeObjectURL(u); OBJECT_URLS.delete(key); } }
async function ensureObjectUrl(key) {
  if (!key || OBJECT_URLS.has(key) || PENDING.has(key)) return;
  PENDING.add(key);
  try { const b = await imageGet(key); if (b) { OBJECT_URLS.set(key, URL.createObjectURL(b)); app.render(); } }
  catch (e) { console.warn(e); } finally { PENDING.delete(key); }
}

/** A form never borrows unapproved artwork; verified forms may reuse the audited base portrait. */
export function characterImageUrl(c) {
  const url = rawImageUrl(c);
  return url && !FAILED.has(url) ? url : null;
}
function rawImageUrl(c) {
  if (!c) return null;
  if (c.phasePortraitUrl) return c.phasePortraitUrl;
  if (c.phaseKey && !c.phasePortraitVerified) return null;
  const remote = STATE.portraits.chars?.[c.id]?.url || null;
  const key = c.seriesId && remote ? `builtin:${c.id}` : null;
  if (key && OBJECT_URLS.has(key)) return OBJECT_URLS.get(key);
  if (key) ensureObjectUrl(key);
  return remote;
}

export async function savePortraitsOffline(chars, progress) {
  let saved = 0, remote = 0, failed = 0, n = 0;
  for (const c of chars) {
    const url = STATE.portraits.chars?.[c.id]?.url, key = `builtin:${c.id}`;
    try {
      if (!url) failed++;
      else if (await imageGet(key)) saved++;
      else {
        try { const r = await fetch(url, { mode: "cors", cache: "force-cache" }); if (!r.ok) throw new Error(String(r.status)); await imagePut(key, await r.blob()); revoke(key); saved++; }
        catch { remote++; }
      }
    } catch { failed++; }
    n++; progress?.({ saved, remote, failed, done: n, total: chars.length });
  }
  return { saved, remote, failed };
}
export async function resetBuiltinPortraits() {
  for (const k of (await imageKeys()).filter(k => String(k).startsWith("builtin:"))) { revoke(k); await imageDelete(k); }
}
export async function offlineCount() { try { return (await imageKeys()).filter(k => String(k).startsWith("builtin:")).length; } catch { return 0; } }
export async function refreshStorageEstimate() {
  if (!navigator.storage?.estimate) { STATE.storageInfo = null; return; }
  try { STATE.storageInfo = await navigator.storage.estimate(); } catch { STATE.storageInfo = null; }
}
if (typeof window !== "undefined") window.addEventListener("beforeunload", () => OBJECT_URLS.forEach(u => URL.revokeObjectURL(u)));
