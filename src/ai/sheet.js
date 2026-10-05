// "Bring them to life": asks the AI for the fused character's name, story and voice, and
// saves it with the fusion. One call per sheet; one rewrite per character so a single
// fusion can't use up the day's game allowance.
import { STATE } from "../core/state.js";
import { app } from "../core/app.js";
import { lang, t, promptCharacterName, promptSeriesName } from "../core/i18n.js";
import { attachSheet } from "../core/history.js";
import { aiConfigured, postAI, usageOf } from "./referee.js";
import { buildSheetPrompt, parseSheet } from "./sheet-format.js";

export const SHEET_TASK = "anime-fusion-sheet";
export const MAX_REWRITES = 1;

export function sheetPromptFor(g, l = lang()) {
  return buildSheetPrompt({
    mode: g.mode, modeLabel: t(g.mode, {}, "en"), lang: l,
    traits: g.assignments.map(a => ({ trait: a.trait, name: promptCharacterName(a.character, l), series: promptSeriesName(a.character, l) })),
  });
}
export function rewritesLeft(g) { return Math.max(0, MAX_REWRITES - (g?.sheet?.rewrites || 0)); }

let inflight = null;
export function writingSheet() { return Boolean(inflight); }
export function cancelSheet() { if (inflight) { inflight.cancelled = true; inflight.abort(); } }

/** First sheet, or (rewrite = true) a new version replacing the old one. */
export async function bringToLife(g = STATE.game, { rewrite = false } = {}) {
  if (!g?.assignments?.length || inflight) return;
  if (!aiConfigured()) { app.go("settings", { section: "ai" }); return; }
  const prev = g.sheet?.data ? g.sheet : null;
  if (prev && !rewrite) return;
  if (prev && rewritesLeft(g) <= 0) return;
  const l = lang();
  g.sheet = { ...(prev || {}), status: "loading", startedAt: Date.now(), error: null };
  app.render();
  const ctl = new AbortController(); inflight = ctl;
  try {
    const res = await postAI({ task: SHEET_TASK, prompt: sheetPromptFor(g, l), maxTokens: 1600, ctl });
    const parsed = res.ok ? parseSheet(res.data.text || "", { traits: g.assignments.map(a => a.trait) }) : null;
    const code = !res.ok ? res.code : parsed.ok ? null : "unreadable";
    if (code) {
      // a failed rewrite keeps the old sheet; nothing is counted
      g.sheet = prev ? { ...prev, status: "done", error: code } : { status: "error", code, detail: res.detail || parsed?.reason || null };
      return;
    }
    g.sheet = {
      status: "done", data: parsed.sheet, lang: l, model: res.data.model || null, at: new Date().toISOString(),
      rewrites: (prev?.rewrites || 0) + (prev ? 1 : 0), usage: usageOf(res.data), fresh: true,
    };
    attachSheet(g);
    STATE.resultSaved = true;
    app.haptic("success");
    const sh = g.sheet; setTimeout(() => { sh.fresh = false; }, 4000);
  } finally {
    inflight = null;
    app.render();
  }
}
