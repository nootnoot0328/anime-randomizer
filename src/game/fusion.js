// Trait Draft and Quick Randomizer. Behaviour ported from v0.6.4 (app.js + patch.js +
// enhancements.js): customizer memory, repeat/discard pools, form siblings, skips.
import { MODES, PROMPT_SCENARIOS } from "../data/game.js";
import { STATE, KEYS } from "../core/state.js";
import { app } from "../core/app.js";
import { t } from "../core/i18n.js";
import { readJSON, writeJSON, pick, sleep } from "../core/util.js";
import { selectedPool, characterIdentityCount, allSeries } from "../core/roster.js";
import { saveFusion } from "../core/history.js";

/* ---- customizer memory (same storage shape as v0.6.x) ---- */
let CUSTOMIZER = { traitsByMode: {} };
export function restoreCustomizer() {
  const saved = readJSON(KEYS.customizer, null);
  if (saved && typeof saved === "object") CUSTOMIZER = { traitsByMode: {}, ...saved };
  if (Array.isArray(CUSTOMIZER.seriesIds)) STATE.selectedSeries = new Set(CUSTOMIZER.seriesIds.filter(id => allSeries().some(s => s.id === id)));
  if (CUSTOMIZER.mode && MODES[CUSTOMIZER.mode]) STATE.selectedMode = CUSTOMIZER.mode;
  if (["all", "male", "female"].includes(CUSTOMIZER.genderFilter)) STATE.genderFilter = CUSTOMIZER.genderFilter;
  if (["repeat", "discard"].includes(CUSTOMIZER.poolMode)) STATE.poolMode = CUSTOMIZER.poolMode;
  const traits = CUSTOMIZER.traitsByMode?.[STATE.selectedMode];
  STATE.selectedTraits = new Set(Array.isArray(traits) ? traits.filter(x => MODES[STATE.selectedMode].includes(x)) : MODES[STATE.selectedMode]);
}
function saveCustomizer() {
  CUSTOMIZER.seriesIds = [...STATE.selectedSeries];
  CUSTOMIZER.mode = STATE.selectedMode;
  CUSTOMIZER.genderFilter = STATE.genderFilter;
  CUSTOMIZER.poolMode = STATE.poolMode || "repeat";
  CUSTOMIZER.traitsByMode = CUSTOMIZER.traitsByMode || {};
  CUSTOMIZER.traitsByMode[STATE.selectedMode] = [...STATE.selectedTraits];
  writeJSON(KEYS.customizer, CUSTOMIZER);
}

/* ---- setup ---- */
export function openSetup(kind) {
  STATE.setupKind = kind === "quick" ? "quick" : "standard";
  const saved = CUSTOMIZER.traitsByMode?.[STATE.selectedMode];
  if (Array.isArray(saved)) STATE.selectedTraits = new Set(saved.filter(x => MODES[STATE.selectedMode].includes(x)));
  if (!STATE.selectedTraits.size && !Array.isArray(saved)) STATE.selectedTraits = new Set(MODES[STATE.selectedMode]);
  app.go("setup");
}
export function setSetupKind(kind) { STATE.setupKind = kind === "quick" ? "quick" : "standard"; app.render(); }
export function toggleSeries(id) { STATE.selectedSeries.has(id) ? STATE.selectedSeries.delete(id) : STATE.selectedSeries.add(id); saveCustomizer(); app.render(); }
export function setAllSeries(on) { STATE.selectedSeries = new Set(on ? allSeries().map(s => s.id) : []); saveCustomizer(); app.render(); }
export function selectMode(mode) {
  if (!MODES[mode]) return;
  CUSTOMIZER.traitsByMode = CUSTOMIZER.traitsByMode || {};
  CUSTOMIZER.traitsByMode[STATE.selectedMode] = [...STATE.selectedTraits];
  STATE.selectedMode = mode;
  const saved = CUSTOMIZER.traitsByMode[mode];
  STATE.selectedTraits = new Set(Array.isArray(saved) ? saved.filter(x => MODES[mode].includes(x)) : MODES[mode]);
  saveCustomizer(); app.render();
}
export function toggleTrait(tr) { STATE.selectedTraits.has(tr) ? STATE.selectedTraits.delete(tr) : STATE.selectedTraits.add(tr); saveCustomizer(); app.render(); }
export function setAllTraits(on) { STATE.selectedTraits = new Set(on ? MODES[STATE.selectedMode] : []); saveCustomizer(); app.render(); }
export function setGenderFilter(g) { STATE.genderFilter = ["all", "male", "female"].includes(g) ? g : "all"; saveCustomizer(); app.render(); }
export function setPoolMode(mode) { STATE.poolMode = mode === "discard" ? "discard" : "repeat"; saveCustomizer(); app.render(); }

/** Why the current setup can't start, or null. Same checks as v0.6.4. */
export function setupProblem(kind = STATE.setupKind) {
  const pool = selectedPool();
  if (!STATE.selectedSeries.size) return "needSeries";
  if (!STATE.selectedTraits.size) return "needTrait";
  const identities = characterIdentityCount(pool);
  if (kind === "quick") {
    if (!pool.length) return "needCharacters";
    if (STATE.poolMode === "discard" && identities < STATE.selectedTraits.size) return "needUniqueCharacters";
    return null;
  }
  if (identities < 2) return "needCharacters";
  // Trait Draft always shows two choices, so discard mode needs one spare character.
  if (STATE.poolMode === "discard" && identities < STATE.selectedTraits.size + 1) return "needUniqueCharacters";
  return null;
}
export function startSetup() { return STATE.setupKind === "quick" ? startQuick() : startDraft(); }

function newGame(kind, extra) {
  const mode = STATE.selectedMode, options = PROMPT_SCENARIOS[mode] || PROMPT_SCENARIOS.protagonist;
  // the image prompt's random scene is chosen once per game and kept with it
  return { kind, mode, promptScenario: Math.floor(Math.random() * options.length), poolMode: STATE.poolMode, ...extra };
}

/* ---- Trait Draft ---- */
export function startDraft() {
  const problem = setupProblem("standard"); if (problem) return app.toast(t(problem));
  STATE.game = newGame("standard", { pool: [...selectedPool()], remaining: [...STATE.selectedTraits], total: STATE.selectedTraits.size, assignments: [], skips: 3, left: null, right: null, tempLeft: null, tempRight: null, revealing: false, selected: null, revealTimer: null, settled: false });
  STATE.resultSaved = false;
  app.go("draft");
  rollDraftPair();
}
function drawPair(g) { g.left = pick(g.pool); do { g.right = pick(g.pool); } while (g.pool.length > 1 && g.right.id === g.left.id); }
export function rollDraftPair() {
  const g = STATE.game; if (!g) return;
  g.revealing = true; g.settled = false; let ticks = 0;
  if (g.revealTimer) clearInterval(g.revealTimer);
  g.revealTimer = setInterval(() => {
    if (STATE.screen !== "draft" || STATE.game !== g) { clearInterval(g.revealTimer); return; }
    g.tempLeft = pick(g.pool); do { g.tempRight = pick(g.pool); } while (g.pool.length > 1 && g.tempRight.id === g.tempLeft.id);
    ticks++;
    if (ticks >= 12) { clearInterval(g.revealTimer); g.revealTimer = null; drawPair(g); g.tempLeft = g.left; g.tempRight = g.right; g.revealing = false; g.settled = true; app.haptic("light"); }
    app.render();
  }, 85);
}
export function chooseCharacter(side) {
  const g = STATE.game; if (!g || g.revealing) return null;
  g.selected = g[side === "right" ? "right" : "left"];
  return g.selected;
}
export function skipRound() { const g = STATE.game; if (!g || g.skips <= 0 || g.revealing) return; g.skips--; rollDraftPair(); }
export function assignTrait(tr) {
  const g = STATE.game; if (!g || !g.selected || !g.remaining.includes(tr)) return;
  const chosen = g.selected;
  g.assignments.push({ trait: tr, character: chosen });
  g.remaining = g.remaining.filter(x => x !== tr);
  if (g.poolMode === "discard") g.pool = g.pool.filter(c => c.id !== chosen.id);
  // a form is a sibling of its character: once one is used, the other forms leave the pool
  else if (chosen.phaseKey) g.pool = g.pool.filter(c => c.id !== chosen.id || c.phaseKey === chosen.phaseKey);
  g.selected = null; app.haptic("success");
  if (g.remaining.length) { app.render(); rollDraftPair(); }
  else app.go("result", { replace: true });
}

/* ---- Quick Randomizer ---- */
export function startQuick() {
  const problem = setupProblem("quick"); if (problem) return app.toast(t(problem));
  cancelFusionTimers();
  const pool = selectedPool();
  STATE.quickReveal = { pool: [...pool], available: [...pool], poolMode: STATE.poolMode, traits: [...STATE.selectedTraits], index: 0, current: null, currentDisplay: null, assignments: [] };
  STATE.resultSaved = false;
  app.go("quickreveal");
  runQuickReveal(++STATE.quickRunId);
}
async function runQuickReveal(runId) {
  const live = () => runId === STATE.quickRunId && STATE.quickReveal;
  for (let i = 0; i < STATE.quickReveal.traits.length; i++) {
    if (!live()) return;
    const q = STATE.quickReveal;
    q.index = i; q.current = q.traits[i];
    const source = q.poolMode === "discard" ? q.available : q.pool;
    if (!source.length) return;
    for (let ticks = 0; ticks < 10; ticks++) { await sleep(80); if (!live()) return; q.currentDisplay = pick(source); app.render(); }
    await sleep(120); if (!live()) return;
    const finalChar = pick(source);
    q.currentDisplay = finalChar;
    q.assignments.push({ trait: q.current, character: finalChar });
    if (q.poolMode === "discard") q.available = q.available.filter(c => c.id !== finalChar.id);
    else if (finalChar.phaseKey) q.pool = q.pool.filter(c => c.id !== finalChar.id || c.phaseKey === finalChar.phaseKey);
    app.haptic("light"); app.render();
    await sleep(300); if (runId !== STATE.quickRunId) return;
  }
  if (!live()) return;
  const q = STATE.quickReveal;
  STATE.game = newGame("quick", { pool: q.pool, remaining: [], assignments: q.assignments, skips: 0, total: q.assignments.length });
  STATE.quickReveal = null;
  app.go("result", { replace: true });
}

export function cancelFusionTimers() {
  if (STATE.game?.revealTimer) { clearInterval(STATE.game.revealTimer); STATE.game.revealTimer = null; STATE.game.revealing = false; }
  STATE.quickRunId++;
}

/* ---- result ---- */
export function saveResult() {
  if (!STATE.game) return;
  const r = saveFusion(STATE.game);
  STATE.resultSaved = true;
  app.toast(t(r === "duplicate" ? "resultSaved" : "saved"));
  app.render();
}
/** A draft is "in progress" while there are traits left to assign. */
export function fusionInProgress() {
  return Boolean((STATE.game && STATE.game.kind === "standard" && STATE.game.remaining?.length) || STATE.quickReveal);
}
