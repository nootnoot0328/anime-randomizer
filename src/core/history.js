// Saved results. Fusion entries keep the v0.6.x shape (entries without a type are
// fusions); v1 adds battle entries that hold the drafted teams and the referee verdict.
import { STATE, KEYS } from "./state.js";
import { readJSON, writeJSON, uuid } from "./util.js";
import { resolveCharacter } from "./roster.js";

const MAX_FUSIONS = 50, MAX_BATTLES = 40;

export function loadHistory() {
  const h = readJSON(KEYS.history, []);
  STATE.history = Array.isArray(h) ? h : [];
}
function persist() {
  const fusions = STATE.history.filter(h => entryType(h) === "fusion").slice(0, MAX_FUSIONS);
  const battles = STATE.history.filter(h => entryType(h) === "battle").slice(0, MAX_BATTLES);
  const keep = new Set([...fusions, ...battles]);
  STATE.history = STATE.history.filter(h => keep.has(h));
  return writeJSON(KEYS.history, STATE.history);
}
export function entryType(h) { return h?.type === "battle" ? "battle" : "fusion"; }

/* ---- fusion ---- */
export function resultSignature(assigns) { return assigns.map(a => `${a.trait}:${a.character.id}:${a.character.phaseKey || "base"}`).join("|"); }
export function isFusionSaved(game) {
  const sig = resultSignature(game?.assignments || []);
  return STATE.history.some(h => entryType(h) === "fusion" && h.signature === sig);
}
/** @returns {"saved"|"duplicate"} */
export function saveFusion(game) {
  const sig = resultSignature(game.assignments);
  if (STATE.history.some(h => entryType(h) === "fusion" && h.signature === sig)) return "duplicate";
  STATE.history.unshift({
    id: uuid(), type: "fusion", date: new Date().toISOString(), mode: game.mode, kind: game.kind, signature: sig, scenario: game.promptScenario ?? null,
    sheet: storedSheet(game.sheet),
    assignments: game.assignments.map(a => ({ trait: a.trait, charId: a.character.id, name: a.character.name_en || a.character.name, name_zh: a.character.name_zh || null, name_ja: a.character.name_ja || null, phaseKey: a.character.phaseKey || null, seriesId: a.character.seriesId || null, series: a.character.series_en || a.character.series || "" })),
  });
  persist();
  return "saved";
}

/** The part of a character sheet worth keeping (not loading/error state). */
export function storedSheet(sh) {
  return sh?.data ? { data: sh.data, rewrites: sh.rewrites || 0, lang: sh.lang || null, model: sh.model || null, at: sh.at || null } : null;
}
export function findFusion(game) {
  const sig = resultSignature(game?.assignments || []);
  return STATE.history.find(h => entryType(h) === "fusion" && h.signature === sig) || null;
}
/** Save the sheet with its fusion, saving the fusion first if needed (a sheet costs an AI call, so it is never thrown away). */
export function attachSheet(game) {
  if (!findFusion(game)) saveFusion(game);
  const h = findFusion(game); if (!h) return false;
  h.sheet = storedSheet(game.sheet); persist(); return true;
}
/** Rebuild a finished fusion from History so the result screen can show it again. */
export function fusionFromEntry(h) {
  const assignments = (h.assignments || []).map(a => ({ trait: a.trait, character: resolveCharacter(a.charId, a.phaseKey) || { id: a.charId, name: a.name, name_en: a.name, name_zh: a.name_zh, name_ja: a.name_ja, seriesId: a.seriesId, series: a.series } }));
  const sheet = h.sheet?.data ? { status: "done", ...h.sheet } : null;
  return { kind: h.kind || "standard", mode: h.mode, promptScenario: h.scenario ?? 0, assignments, remaining: [], total: assignments.length, skips: 0, sheet, fromHistory: true, historyId: h.id };
}

/* ---- battles ---- */
const snapTeam = p => ({ seriesId: p.seriesId, roles: [...p.roles], team: p.team.map(x => ({ role: x.role, id: x.character.id, phaseKey: x.character.phaseKey || null, price: x.price || 0 })), budget: p.budget ?? null });
export function saveBattle(pk) {
  const entry = {
    id: uuid(), type: "battle", date: new Date().toISOString(), kind: pk.kind, opponent: pk.opponent, difficulty: pk.difficulty,
    battlefieldSeriesId: pk.battlefieldSeriesId, p1: snapTeam(pk.p1), p2: snapTeam(pk.p2), referee: null,
  };
  STATE.history.unshift(entry);
  persist();
  return entry.id;
}
export function attachVerdict(historyId, referee) {
  const h = STATE.history.find(x => x.id === historyId); if (!h) return false;
  h.referee = referee; persist(); return true;
}
export function deleteEntry(id) { STATE.history = STATE.history.filter(h => h.id !== id); persist(); }
/** Rebuild a playable-looking match object from a saved battle. */
export function battleFromEntry(h) {
  const team = t => ({ seriesId: t.seriesId, roles: t.roles, budget: t.budget, team: t.team.map(x => ({ role: x.role, character: resolveCharacter(x.id, x.phaseKey), price: x.price })).filter(x => x.character) });
  return { kind: h.kind, opponent: h.opponent, difficulty: h.difficulty, battlefieldSeriesId: h.battlefieldSeriesId, p1: team(h.p1), p2: team(h.p2), historyId: h.id, referee: h.referee || null, ended: true, fromHistory: true };
}
