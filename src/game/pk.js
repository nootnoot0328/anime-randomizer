// PK team draft: Random (pairs, one skip each) and $100 Budget (shared roster, one sale,
// may finish early). Local 2-player or VS Computer. Ported from v0.6.4 pk-v2.js.
import { STATE } from "../core/state.js";
import { app } from "../core/app.js";
import { t, displayName, roleLabel } from "../core/i18n.js";
import { decideRandom, decideBudget } from "./cpu.js";
import { allSeries, getSeries, pkCharacters, roleSet, budgetRoleSet, characterPrice } from "../core/roster.js";
import { saveBattle } from "../core/history.js";

const L = () => globalThis.AnimeFusionLogic;

export function eligibleSeries() { return allSeries().filter(s => s.chars?.length); }

/* ---- setup ---- */
export function openPKSetup(kind = "random") {
  const list = eligibleSeries(), first = list[0]?.id || null, second = list[1]?.id || first, s = STATE.pkSetup || {};
  STATE.pkSetup = { kind: kind === "budget" ? "budget" : "random", p1: s.p1 || first, p2: s.p2 || second, pool: s.pool || first, opponent: s.opponent || "local", difficulty: s.difficulty || "strategic" };
  app.go("pksetup");
}
export function updatePKSetup(which, value) { STATE.pkSetup[which] = value; app.render(); }

/** What a Random PK needs: each side's pool vs six roles (shared pool when both pick the same series). */
export function pkSetupRequirement() {
  const ps = STATE.pkSetup, eligible = eligibleSeries();
  if (ps.kind === "budget") {
    const pool = getSeries(ps.pool) || eligible[0];
    const n = pkCharacters(pool?.chars).length;
    return { ok: n >= 10, shared: true, available: n, required: 10 };
  }
  const s1 = getSeries(ps.p1) || eligible[0];
  const s2 = ps.p2 === "__random__" ? (eligible.find(s => s.id !== s1.id) || eligible[0]) : (getSeries(ps.p2) || eligible[Math.min(1, eligible.length - 1)]);
  const p1 = pkCharacters(s1.chars), p2 = pkCharacters(s2.chars), shared = s1.id === s2.id;
  return { ...L().pkRequirement(p1, p2, 6, 6, shared), s1, s2 };
}

function pickBattlefield(pk) {
  const ids = [pk.p1.seriesId, pk.p2.seriesId].filter(Boolean);
  pk.battlefieldSeriesId = ids.length > 1 && ids[0] !== ids[1] ? ids[Math.floor(Math.random() * 2)] : ids[0];
}
function baseMatch(kind) {
  return { kind, opponent: STATE.pkSetup.opponent || "local", difficulty: STATE.pkSetup.difficulty || "strategic", turn: 1, used: new Set(), cpuTimer: null, cpuThinking: false, selectedIndex: null, ended: false, historyId: null, referee: null, justFilled: null };
}
export function startPK() {
  const ps = STATE.pkSetup, eligible = eligibleSeries();
  if (ps.kind === "budget") return startBudgetPK();
  const p1 = ps.p1, p2 = ps.opponent === "cpu" && ps.p2 === "__random__" ? eligible[Math.floor(Math.random() * eligible.length)]?.id : ps.p2;
  const s1 = getSeries(p1), s2 = getSeries(p2); if (!s1 || !s2) return;
  const shared = p1 === p2, req = L().pkRequirement(pkCharacters(s1.chars), pkCharacters(s2.chars), 6, 6, shared); if (!req.ok) return;
  cancelPKTimers();
  STATE.pk = { ...baseMatch("random"), p1: { seriesId: p1, roles: roleSet(p1), team: [] }, p2: { seriesId: p2, roles: roleSet(p2), team: [] }, shared, pair: [], revealing: false, revealTimer: null, skips: { 1: 1, 2: 1 } };
  pickBattlefield(STATE.pk);
  app.go("pk");
  rollPKPair();
}
export function startBudgetPK() {
  const id = STATE.pkSetup.pool, s = getSeries(id), pool = pkCharacters(s?.chars || []); if (!s || pool.length < 10) return;
  const roles = budgetRoleSet(id);
  cancelPKTimers();
  const side = () => ({ seriesId: id, roles: [...roles], team: [], budget: 100, sellUsed: false, finished: false });
  STATE.pk = { ...baseMatch("budget"), p1: side(), p2: side(), shared: true };
  pickBattlefield(STATE.pk);
  app.go("pk");
}
/** Same opponents and series again (Random keeps the resolved random series). */
export function rematch() {
  const pk = STATE.pk; if (!pk) return openPKSetup();
  STATE.pkSetup = { ...STATE.pkSetup, kind: pk.kind, opponent: pk.opponent, difficulty: pk.difficulty || "strategic", p1: pk.p1.seriesId, p2: pk.p2.seriesId, pool: pk.p1.seriesId };
  return pk.kind === "budget" ? startBudgetPK() : startPK();
}

/* ---- turn state ---- */
export function pkPool(player) { const pk = STATE.pk, p = pk[`p${player}`]; return pkCharacters(getSeries(p.seriesId)?.chars || []).filter(c => !pk.used.has(c.id)); }
export function isCPUTurn() { return Boolean(STATE.pk?.opponent === "cpu" && STATE.pk.turn === 2 && !STATE.pk.ended); }
export function pkPlayerLabel(n, pk = STATE.pk) { return n === 2 && pk?.opponent === "cpu" ? t("computer") : t(`player${n}`); }
export function budgetPlayerDone(p) { return Boolean(p.finished || p.team.length >= p.roles.length); }
export function pkComplete(pk = STATE.pk) {
  if (!pk) return false;
  if (pk.kind === "budget") return budgetPlayerDone(pk.p1) && budgetPlayerDone(pk.p2);
  return pk.p1.team.length >= pk.p1.roles.length && pk.p2.team.length >= pk.p2.roles.length;
}
export function pkOver(pk = STATE.pk) { return Boolean(pk && (pk.ended || pkComplete(pk))); }
export function openRoles(player) { const p = STATE.pk[`p${player}`]; return p.roles.filter(r => !p.team.some(x => x.role === r)); }
/** Budget roster, priciest first so the stars are at the top; stable for equal prices. */
export function budgetPool() {
  return pkPool(STATE.pk?.turn || 1).map((c, i) => ({ c, i })).sort((a, b) => characterPrice(b.c) - characterPrice(a.c) || a.i - b.i).map(x => x.c);
}
export function budgetCanBuy(c) { const pk = STATE.pk, p = pk[`p${pk.turn}`]; return characterPrice(c) <= p.budget; }
export function candidates() { const pk = STATE.pk; if (!pk) return []; return pk.kind === "random" ? (pk.pair || []) : budgetPool(); }
export function selectedPKCharacter() { const pk = STATE.pk; if (!pk || pk.selectedIndex === null) return null; return candidates()[pk.selectedIndex] || null; }

/* ---- CPU ---- */
function scheduleCPUTurn(delay = 650) {
  const pk = STATE.pk; if (!isCPUTurn() || pk.cpuTimer || pk.revealing || pkComplete()) return;
  pk.cpuThinking = true; app.render();
  pk.cpuTimer = setTimeout(() => { if (STATE.screen !== "pk" || STATE.pk !== pk || !isCPUTurn()) return; pk.cpuTimer = null; cpuTakeTurn(); }, delay);
}
function cpuTakeTurn() {
  const pk = STATE.pk; if (!isCPUTurn() || pk.revealing || pkComplete()) return;
  const roles = openRoles(2); if (!roles.length) { pk.cpuThinking = false; return; }
  const commit = (character, role, index) => {
    pk.selectedIndex = index; app.render();
    pk.cpuTimer = setTimeout(() => {
      if (STATE.pk !== pk || !isCPUTurn()) return;
      pk.cpuLast = { id: character.id, role };
      assignPKCharacter(role, character);
      app.toast(t("cpuPicked", { name: displayName(character), role: roleLabel(role) }));
    }, 420);
  };
  if (pk.kind === "random") {
    const pair = pk.pair || []; if (!pair.length) { pk.cpuThinking = false; rollPKPair(); return; }
    const d = decideRandom({ pair, openRoles: roles, pool: pkPool(2), difficulty: pk.difficulty, canSkip: Boolean(pk.skips[2]) });
    if (d.action === "skip") { pk.cpuThinking = false; app.toast(t("cpuSkipped")); skipPKPair(true); return; }
    return commit(pair[d.index], d.role, d.index);
  }
  const p = pk.p2, pool = budgetPool();
  const d = decideBudget({ pool, team: p.team, openRoles: roles, budget: p.budget, sellUsed: p.sellUsed, difficulty: pk.difficulty, price: characterPrice });
  if (d.action === "sell") { const sold = p.team.find(x => x.role === d.role); sellBudgetCharacter(2, d.role, true); pk.cpuThinking = false; if (sold) app.toast(t("cpuSold", { name: displayName(sold.character) })); scheduleCPUTurn(700); return; }
  if (d.action === "finish" || !p.team.length && d.action !== "buy") { pk.cpuThinking = false; if (p.team.length) finishBudgetTeam(true); else pk.ended = true; return; }
  const index = pool.findIndex(c => c.id === d.character.id && c.phaseKey === d.character.phaseKey);
  commit(d.character, d.role, index);
}

/* ---- Random PK pairs ---- */
export function rollPKPair() {
  const pk = STATE.pk; if (!pk || pk.kind !== "random") return;
  const pool = pkPool(pk.turn); if (pk.revealTimer) clearInterval(pk.revealTimer);
  if (pool.length <= 1) { pk.pair = [...pool]; pk.revealing = false; app.render(); scheduleCPUTurn(); return; }
  pk.revealing = true; pk.selectedIndex = null; let ticks = 0;
  pk.revealTimer = setInterval(() => {
    if (STATE.screen !== "pk" || STATE.pk !== pk) { clearInterval(pk.revealTimer); pk.revealTimer = null; pk.revealing = false; return; }
    pk.pair = L().shuffle(pool).slice(0, 2); ticks++;
    if (ticks >= 10) { clearInterval(pk.revealTimer); pk.revealTimer = null; pk.pair = L().shuffle(pool).slice(0, 2); pk.revealing = false; pk.settledAt = Date.now(); }
    app.render();
    if (!pk.revealing) scheduleCPUTurn();
  }, 70);
}
export function skipPKPair(byCPU = false) {
  const pk = STATE.pk; if (!pk || pk.kind !== "random" || pk.revealing || !pk.skips[pk.turn]) return;
  if (isCPUTurn() && !byCPU) return;
  const skipped = new Set((pk.pair || []).map(c => c.id)), fresh = pkPool(pk.turn).filter(c => !skipped.has(c.id));
  pk.skips[pk.turn] = 0; pk.pair = []; pk.selectedIndex = null;
  if (fresh.length >= 2) {
    pk.revealing = true; let ticks = 0;
    pk.revealTimer = setInterval(() => {
      if (STATE.pk !== pk) { clearInterval(pk.revealTimer); return; }
      pk.pair = L().shuffle(fresh).slice(0, 2); ticks++;
      if (ticks >= 10) { clearInterval(pk.revealTimer); pk.revealTimer = null; pk.revealing = false; pk.settledAt = Date.now(); }
      app.render();
      if (!pk.revealing) scheduleCPUTurn();
    }, 70);
  } else { app.render(); rollPKPair(); }
}

/* ---- picking ---- */
export function selectPKCandidate(i) {
  const pk = STATE.pk; if (!pk || pk.revealing || isCPUTurn()) return false;
  pk.selectedIndex = pk.selectedIndex === i ? null : i; app.render();
  return pk.selectedIndex !== null;
}
export function assignSelectedPKRole(player, role) {
  const pk = STATE.pk; if (!pk || player !== pk.turn || isCPUTurn()) return;
  const c = selectedPKCharacter(); if (!c) return;
  if (pk.kind === "budget" && !budgetCanBuy(c)) return app.toast(t("budgetRule"));
  assignPKCharacter(role, c);
}
export function assignPKCharacter(role, c) {
  const pk = STATE.pk, current = pk.turn, p = pk[`p${current}`];
  if (!p.roles.includes(role) || p.team.some(x => x.role === role) || pk.used.has(c.id)) return;
  const price = pk.kind === "budget" ? characterPrice(c) : 0; if (pk.kind === "budget" && !budgetCanBuy(c)) return;
  p.team.push({ role, character: c, price }); if (pk.kind === "budget") p.budget -= price;
  pk.used.add(c.id); pk.selectedIndex = null; pk.cpuThinking = false; pk.cpuTimer = null;
  pk.justFilled = { player: current, role, at: Date.now() };
  app.haptic("success");
  const other = pk.turn === 1 ? 2 : 1;
  if (pk.kind === "budget") {
    if (p.team.length >= p.roles.length) p.finished = true;
    if (!budgetPlayerDone(pk[`p${other}`])) pk.turn = other;
    if (budgetPlayerDone(pk.p1) && budgetPlayerDone(pk.p2)) pk.ended = true;
  } else if (pk[`p${other}`].team.length < pk[`p${other}`].roles.length) pk.turn = other;
  if (pkComplete()) return finishMatch();
  app.render();
  if (pk.kind === "random") rollPKPair(); else scheduleCPUTurn();
}
export function sellBudgetCharacter(player, role, byCPU = false) {
  const pk = STATE.pk, p = pk?.[`p${player}`];
  if (!pk || pk.kind !== "budget" || player !== pk.turn || p.sellUsed || p.finished) return;
  if (isCPUTurn() && !byCPU) return;
  const index = p.team.findIndex(x => x.role === role); if (index < 0) return;
  const [sold] = p.team.splice(index, 1); p.budget += sold.price; pk.used.delete(sold.character.id); p.sellUsed = true; pk.selectedIndex = null;
  app.toast(`${displayName(sold.character)} +$${sold.price}`); app.render();
}
export function finishBudgetTeam(byCPU = false) {
  const pk = STATE.pk, p = pk?.[`p${pk?.turn}`];
  if (!pk || pk.kind !== "budget" || !p || budgetPlayerDone(p)) return;
  if (isCPUTurn() && !byCPU) return;
  if (!p.team.length) return app.toast(t("pickBeforeFinish"));
  p.finished = true; pk.selectedIndex = null; pk.cpuThinking = false; pk.cpuTimer = null;
  const other = pk.turn === 1 ? 2 : 1;
  if (!budgetPlayerDone(pk[`p${other}`])) pk.turn = other; else pk.ended = true;
  if (pkOver()) return finishMatch();
  app.render(); scheduleCPUTurn();
}
export function endPKEarly() { if (!STATE.pk || pkOver()) return; STATE.pk.ended = true; finishMatch(); }

function finishMatch() {
  const pk = STATE.pk;
  cancelPKTimers();
  if (!pk.historyId) pk.historyId = saveBattle(pk);
  app.matchComplete(pk);
  app.render();
}

export function cancelPKTimers() {
  const pk = STATE.pk; if (!pk) return;
  if (pk.revealTimer) { clearInterval(pk.revealTimer); pk.revealTimer = null; pk.revealing = false; }
  if (pk.cpuTimer) { clearTimeout(pk.cpuTimer); pk.cpuTimer = null; pk.cpuThinking = false; }
}
/** Pick the draft back up after leaving the screen (timers were stopped on the way out). */
export function resumePK() {
  const pk = STATE.pk; if (!pk) return;
  app.go("pk");
  if (pkOver()) return;
  if (pk.kind === "random" && (!pk.pair || pk.pair.length < 2)) rollPKPair(); else scheduleCPUTurn(400);
}
export function pkInProgress() { return Boolean(STATE.pk && !STATE.pk.fromHistory && !pkOver()); }
