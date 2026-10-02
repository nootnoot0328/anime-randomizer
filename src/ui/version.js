// Compares the running version with version.json on the server (cache-busted).
import { STATE, VERSION } from "../core/state.js";

export async function checkVersion() {
  STATE.versionInfo = { current: VERSION, latest: null, status: "unknown" };
  try {
    const r = await fetch(`version.json?ts=${Date.now()}`, { cache: "no-store" }); if (!r.ok) throw new Error();
    const d = await r.json(), cmp = globalThis.AnimeFusionLogic.compareVersions(d.version, VERSION);
    STATE.versionInfo = { current: VERSION, latest: d.version || null, status: cmp === 1 ? "update" : cmp === 0 ? "ok" : "unknown" };
  } catch { }
  return STATE.versionInfo;
}
