// AI referee: sends the judge prompt (JSON answer format) to the Setpoint Worker with the
// game-scoped key, validates the verdict and stores it with the match. A stored verdict
// is final: the result screen shows it instead of asking again, so a match can't be
// re-rolled until the answer someone likes comes up.
import { STATE, KEYS } from "../core/state.js";
import { app } from "../core/app.js";
import { writeJSON } from "../core/util.js";
import { lang, promptCharacterName } from "../core/i18n.js";
import { buildPKJudgePrompt } from "../core/prompts.js";
import { attachVerdict } from "../core/history.js";
import { parseVerdict } from "./format.js";

export const TASK = "anime-fusion-judge";
const TIMEOUT_MS = 90_000;

export function aiConfigured() { return Boolean(STATE.ai?.url && STATE.ai?.key); }
function base(url) { return String(url || "").trim().replace(/\/+$/, ""); }

export function saveAIConfig(url, key) {
  STATE.ai = { url: base(url), key: String(key || "").trim() };
  writeJSON(KEYS.ai, STATE.ai);
}
export function clearAIConfig() { STATE.ai = { url: "", key: "" }; writeJSON(KEYS.ai, STATE.ai); STATE.aiTest = null; }

async function fetchJSON(url, opts = {}, ms = 15000) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { ...opts, signal: ctl.signal, cache: "no-store" });
    let data = null; try { data = await r.json(); } catch { }
    return { status: r.status, data };
  } finally { clearTimeout(timer); }
}

/**
 * Check a Worker address and key without spending an AI call:
 *  1. GET /           → reachable, AI provider set, GAME_KEY configured
 *  2. GET /state      → must be refused; if it works this is the Setpoint APP_KEY
 *  3. POST /ai (task "ping") → 403 means a valid, correctly scoped game key; 401 means wrong key
 * @returns {{ok:boolean, code:string, detail?:string}}
 */
export async function testConnection(url, key) {
  url = base(url); key = String(key || "").trim();
  if (!/^https:\/\/[^/]+/.test(url)) return { ok: false, code: "badUrl" };
  if (!key) return { ok: false, code: "noKey" };
  try {
    const h = await fetchJSON(url + "/");
    if (h.status !== 200 || !h.data?.ok) return { ok: false, code: "unreachable" };
    if (!h.data.ai) return { ok: false, code: "noProvider" };
    if (!h.data.game) return { ok: false, code: "noGameKey", detail: h.data.version };
    const auth = { Authorization: "Bearer " + key };
    const s = await fetchJSON(url + "/state", { headers: auth });
    if (s.status === 200) return { ok: false, code: "isAppKey" };
    const p = await fetchJSON(url + "/ai", { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ task: "ping", prompt: "ping" }) });
    if (p.status === 403) return { ok: true, code: "ok", detail: h.data.ai };
    if (p.status === 401) return { ok: false, code: "badKey" };
    return { ok: false, code: "unexpected", detail: String(p.status) };
  } catch (e) {
    return { ok: false, code: e?.name === "AbortError" ? "timeout" : "unreachable" };
  }
}

/** Names exactly as the prompt lists them, so the MVP can be matched back to a character. */
export function draftedNames(pk, l) {
  return [...pk.p1.team, ...pk.p2.team].map(x => promptCharacterName(x.character, l));
}
export function matchupCount(pk) { return Math.min(5, pk.p1.roles.length, pk.p2.roles.length); }

let inflight = null;
export async function judge(pk = STATE.pk) {
  if (!pk || inflight) return;
  if (pk.referee?.verdict) return; // final
  if (!aiConfigured()) { app.go("settings", { section: "ai" }); return; }
  const l = lang();
  pk.referee = { status: "loading", startedAt: Date.now(), lang: l };
  app.render();
  const prompt = buildPKJudgePrompt(pk, l, "json");
  const ctl = new AbortController(); inflight = ctl;
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(base(STATE.ai.url) + "/ai", {
      method: "POST", signal: ctl.signal, cache: "no-store",
      headers: { Authorization: "Bearer " + STATE.ai.key, "Content-Type": "application/json" },
      body: JSON.stringify({ task: TASK, prompt, maxTokens: 2000 }),
    });
    let data = null; try { data = await r.json(); } catch { }
    if (!r.ok) {
      const code = r.status === 401 ? "badKey" : r.status === 429 ? "limit" : r.status === 403 ? "scope" : r.status === 501 ? "noProvider" : "server";
      pk.referee = { status: "error", code, detail: data?.error || String(r.status), lang: l };
      return;
    }
    const parsed = parseVerdict(data?.text || "", { names: draftedNames(pk, l), matchupCount: matchupCount(pk) });
    if (!parsed.ok) { pk.referee = { status: "error", code: "unreadable", detail: parsed.reason, raw: String(data?.text || "").slice(0, 4000), lang: l }; return; }
    pk.referee = { status: "done", verdict: parsed.verdict, lang: l, model: data.model || null, provider: data.provider || null, at: new Date().toISOString(), fresh: true, usage: data.used && data.limit ? { used: data.used, limit: data.limit } : null };
    if (pk.historyId) attachVerdict(pk.historyId, { verdict: parsed.verdict, lang: l, model: pk.referee.model, at: pk.referee.at });
    app.haptic("success");
    // the commentary plays out once; after that the report shows everything at rest
    const ref = pk.referee; setTimeout(() => { ref.fresh = false; }, (parsed.verdict.commentary.length * 0.9 + 3) * 1000);
  } catch (e) {
    pk.referee = { status: "error", code: e?.name === "AbortError" ? (ctl.cancelled ? "cancelled" : "timeout") : "offline", lang: l };
  } finally {
    clearTimeout(timer); inflight = null;
    app.render();
  }
}
export function cancelJudge() { if (inflight) { inflight.cancelled = true; inflight.abort(); } }
export function judging() { return Boolean(inflight); }
