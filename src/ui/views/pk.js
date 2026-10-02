import { STATE } from "../../core/state.js";
import { t, charSeries, displayName, displaySeries, roleLabel } from "../../core/i18n.js";
import { getSeries, pkCharacters, characterPrice, roleSet, budgetRoleSet, isTraitorRole } from "../../core/roster.js";
import { esc, icon, act, avatar, seg, sectionHead } from "../parts.js";
import { screen, actions, inputs, openSheet, sheetHead, closeSheet, confirmSheet, render } from "../shell.js";
import * as P from "../../game/pk.js";
import { battleReport } from "./battle.js";

/* ---------------------------------------------------------------- setup */
function seriesSelect(name, value, { random = false } = {}) {
  const list = P.eligibleSeries();
  return `<label class="select"><select data-input="pk.series" data-which="${name}" aria-label="${esc(t("series"))}">${random ? `<option value="__random__"${value === "__random__" ? " selected" : ""}>${esc(t("randomSeries"))}</option>` : ""}${list.map(s => `<option value="${esc(s.id)}"${s.id === value ? " selected" : ""}>${esc(displaySeries(s))} · ${pkCharacters(s.chars).length}</option>`).join("")}</select>${icon("chevron", "sel-ic")}</label>`;
}
function rolePreview(seriesId, budget) {
  if (!seriesId || seriesId === "__random__") return `<p class="hint">${esc(t("randomSeriesHint"))}</p>`;
  const roles = budget ? budgetRoleSet(seriesId) : roleSet(seriesId);
  return `<div class="role-preview">${roles.map(r => `<span class="${isTraitorRole(r) ? "traitor" : ""}">${esc(roleLabel(r))}</span>`).join("")}</div>`;
}
screen("pksetup", {
  title: () => t(STATE.pkSetup.kind === "budget" ? "budgetPK" : "randomPK"),
  render: ({ first }) => {
    const ps = STATE.pkSetup, cpu = ps.opponent === "cpu", budget = ps.kind === "budget", req = P.pkSetupRequirement();
    const opponent = `<section class="card">${sectionHead(t("matchType"))}
      ${seg([{ v: "local", label: t("localPlayers"), icon: "user" }, { v: "cpu", label: t("vsComputer"), icon: "cpu" }], ps.opponent, "pk.opponent")}
      ${cpu ? `<label class="field-label">${esc(t("difficulty"))}</label>${seg([{ v: "casual", label: t("casualCPU") }, { v: "strategic", label: t("strategicCPU") }], ps.difficulty === "casual" ? "casual" : "strategic", "pk.difficulty")}` : ""}</section>`;
    let body;
    if (budget) {
      body = `<section class="card">${sectionHead(t("sharedRoster"), "", t("budgetRulesShort"))}${seriesSelect("pool", ps.pool)}
        <div class="req ${req.ok ? "ok" : "bad"}">${icon(req.ok ? "check" : "info")}<span>${esc(t("rosterNeed", { n: req.available, need: req.required }))}</span></div>
        <label class="field-label">${esc(t("rolesEach"))}</label>${rolePreview(ps.pool, true)}</section>`;
    } else {
      const team = (n, val) => `<section class="card team-pick p${n}"><div class="team-pick-head"><span class="team-dot"></span><strong>${esc(n === 2 && cpu ? t("computer") : t(`player${n}`))}</strong></div>${seriesSelect(`p${n}`, val, { random: n === 2 && cpu })}${rolePreview(val, false)}</section>`;
      const reqText = req.shared ? t("sharedNeed", { n: req.availableShared, need: req.requiredShared }) : t("teamsNeed", { a: req.availableP1, b: req.availableP2 });
      body = `${team(1, ps.p1)}<div class="vs-divider"><span>VS</span></div>${team(2, ps.p2)}<div class="req ${req.ok ? "ok" : "bad"}">${icon(req.ok ? "check" : "info")}<span>${esc(reqText)}</span></div>`;
    }
    return `<div class="pksetup${first ? " stagger" : ""}">
      ${seg([{ v: "random", label: t("randomPK"), icon: "swords" }, { v: "budget", label: t("budgetPK"), icon: "coin" }], ps.kind, "pk.kind", "seg-lg")}
      <p class="lede">${esc(t(budget ? "budgetPKDesc" : "pkDesc"))}</p>${opponent}${body}</div>
      <div class="dock"><div class="dock-info"><strong>${esc(t(budget ? "budgetPK" : "randomPK"))}</strong><small>${esc(t(cpu ? "vsComputer" : "localPlayers"))}</small></div><button class="btn primary" ${act("pk.start")} ${req.ok ? "" : 'aria-disabled="true"'}>${icon("swords")}<span>${esc(t("beginPK"))}</span></button></div>`;
  },
});

/* ---------------------------------------------------------------- draft board */
function slot(pk, n, role, active) {
  const p = pk[`p${n}`], hit = p.team.find(x => x.role === role), traitor = isTraitorRole(role) ? " traitor" : "";
  const just = pk.justFilled && pk.justFilled.player === n && pk.justFilled.role === role && Date.now() - pk.justFilled.at < 900 ? " pop" : "";
  if (!hit) {
    const open = active && !P.isCPUTurn();
    const selected = open && pk.selectedIndex !== null;
    return `<div class="slot empty${traitor}${open ? " droppable" : ""}${selected ? " ready" : ""}" data-key="${esc(role)}" data-slot data-player="${n}" data-role="${esc(role)}" ${open ? `role="button" tabindex="0" ${act("pk.slot", `${n}|${role}`)}` : ""}><span class="slot-role">${esc(roleLabel(role))}</span><span class="slot-plus">${icon("plus")}</span></div>`;
  }
  const canSell = pk.kind === "budget" && active && !p.sellUsed && !P.isCPUTurn();
  return `<div class="slot filled${traitor}${just}${canSell ? " sellable" : ""}" data-key="${esc(role)}" data-slot data-player="${n}" data-role="${esc(role)}"${canSell ? ` role="button" tabindex="0" aria-label="${esc(t("sellCharacter"))} ${esc(displayName(hit.character))}" ${act("pk.sell", `${n}|${role}`)}` : ""}>${avatar(hit.character, "av-slot")}<span class="slot-role">${esc(roleLabel(role))}</span><strong class="slot-name">${esc(displayName(hit.character))}</strong>${pk.kind === "budget" ? `<span class="slot-price">$${hit.price}</span>` : ""}</div>`;
}
export function teamPanel(pk, n, { live = true } = {}) {
  const p = pk[`p${n}`], s = getSeries(p.seriesId);
  const active = live && pk.turn === n && !P.pkOver(pk) && !(pk.kind === "budget" && P.budgetPlayerDone(p));
  const done = pk.kind === "budget" ? P.budgetPlayerDone(p) : p.team.length >= p.roles.length;
  return `<section class="team p${n}${active ? " active" : ""}${done && live ? " done" : ""}" data-key="team${n}">
    <header><span class="team-dot"></span><div class="team-id"><strong>${esc(P.pkPlayerLabel(n, pk))}</strong><small>${esc(displaySeries(s))}</small></div>
    <span class="team-meta">${pk.kind === "budget" ? `<b class="money">$${p.budget}</b>` : ""}<span class="mono">${p.team.length}/${p.roles.length}</span>${done && live ? icon("check", "done-ic") : ""}</span></header>
    <div class="slots n${p.roles.length}">${p.roles.map(r => slot(pk, n, r, active)).join("")}</div></section>`;
}
function candidate(c, i, pk, { disabled = false, keyed = false } = {}) {
  const sel = pk.selectedIndex === i, budget = pk.kind === "budget", price = characterPrice(c);
  const key = keyed ? `${c.id}::${c.phaseKey || ""}` : `cand${i}`;
  return `<button class="cand${sel ? " on" : ""}${disabled ? " off" : ""}${pk.revealing ? " shuffling" : ""}" data-key="${esc(key)}" data-cand="${i}" ${budget ? "" : "data-drag"} ${act("pk.pick", i)} ${disabled ? 'aria-disabled="true"' : ""}>
    ${avatar(c, "av-cand")}<span class="cand-text"><strong>${esc(displayName(c))}</strong>${budget ? `<span class="price t${price}">$${price}</span>` : `<small>${esc(charSeries(c))}</small>`}</span></button>`;
}
function board() {
  const pk = STATE.pk, cpu = P.isCPUTurn(), p = pk[`p${pk.turn}`];
  const actionsHtml = pk.kind === "random"
    ? `<button class="btn ghost sm" ${act("pk.skip")} ${cpu || pk.revealing || !pk.skips[pk.turn] ? 'aria-disabled="true"' : ""}>${icon("refresh")}<span>${esc(pk.skips[pk.turn] ? t("skipPair") : t("skipUsed"))}</span></button>`
    : `<button class="btn ghost sm" ${act("pk.finish")} ${cpu || !p.team.length ? 'aria-disabled="true"' : ""}>${icon("flag")}<span>${esc(t("finishTeam"))}</span></button>`;
  const hint = cpu ? t("computerThinking") : pk.kind === "random" ? t("hintRandom") : (p.sellUsed ? t("hintBudgetSold") : t("hintBudget"));
  const turnbar = `<div class="turnbar p${pk.turn}${cpu ? " thinking" : ""}" data-key="turnbar"><span class="turn-dot"></span><div class="turn-text"><strong>${esc(t("turnOf", { name: P.pkPlayerLabel(pk.turn) }))}${pk.kind === "budget" ? ` · <b class="money">$${p.budget}</b>` : ""}</strong><small>${esc(hint)}</small></div>${actionsHtml}</div>`;
  let tray;
  if (pk.kind === "random") {
    const pair = pk.pair || [];
    tray = pair.length ? `<div class="pair-tray${pk.revealing ? " revealing" : ""}" data-key="tray">${pair.map((c, i) => candidate(c, i, pk, { disabled: cpu || pk.revealing })).join(`<span class="vs-mini">VS</span>`)}</div>`
      : `<div class="empty" data-key="tray">${esc(t("emptyPool"))}<button class="btn danger sm" ${act("pk.end")}>${esc(t("endMatch"))}</button></div>`;
  } else {
    const pool = P.budgetPool();
    tray = `<div class="mini-label" data-key="pool-label">${esc(t("sharedRoster"))} · ${pool.length}</div><div class="budget-grid" data-key="tray">${pool.map((c, i) => candidate(c, i, pk, { disabled: cpu || !P.budgetCanBuy(c), keyed: true })).join("")}</div>`;
  }
  return `<div class="board ${pk.kind}">${turnbar}<div class="teams">${teamPanel(pk, 1)}${teamPanel(pk, 2)}</div>${tray}</div>`;
}
screen("pk", {
  title: () => t(STATE.pk?.kind === "budget" ? "budgetPK" : "randomPK"),
  hideTabs: () => P.pkInProgress() && STATE.screen === "pk",
  render: ctx => {
    const pk = STATE.pk; if (!pk) return `<div class="empty">${esc(t("noGame"))}</div>`;
    return P.pkOver(pk) ? battleReport(pk, ctx) : board();
  },
  leave: () => { P.cancelPKTimers(); closeSheet(true); },
});

/* ---------------------------------------------------------------- picking */
function openRoleSheet(i) {
  const pk = STATE.pk, c = P.candidates()[i]; if (!c) return;
  const roles = P.openRoles(pk.turn), p = pk[`p${pk.turn}`], price = characterPrice(c), budget = pk.kind === "budget", can = !budget || P.budgetCanBuy(c);
  openSheet(`${sheetHead(t("assignRole"), charSeries(c))}
    <div class="sheet-hero">${avatar(c, "av-xl")}<div><strong>${esc(displayName(c))}</strong>${budget ? `<span class="price-line"><span class="price t${price}">$${price}</span> → ${esc(t("leftAfter", { n: p.budget - price }))}</span>` : ""}</div></div>
    ${can ? `<div class="trait-grid">${roles.map(r => `<button class="trait-btn${isTraitorRole(r) ? " traitor" : ""}" ${act("pk.assign", r)}>${esc(roleLabel(r))}</button>`).join("")}</div>` : `<p class="sheet-body bad">${esc(t("budgetRule"))}</p>`}`,
  { onClose: () => { if (STATE.pk === pk && pk.selectedIndex === i) { pk.selectedIndex = null; render(); } } });
}

/* drag a Random PK candidate onto an open slot (touch or mouse) */
let drag = null, suppressClickUntil = 0;
function onPointerDown(e) {
  const card = e.target.closest("[data-drag]"); if (!card || e.button > 0) return;
  const pk = STATE.pk; if (!pk || pk.revealing || P.isCPUTurn()) return;
  drag = { i: Number(card.dataset.cand), x: e.clientX, y: e.clientY, card, ghost: null, moved: false, id: e.pointerId };
}
function onPointerMove(e) {
  if (!drag || e.pointerId !== drag.id) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return;
  e.preventDefault();
  if (!drag.moved) {
    drag.moved = true;
    const r = drag.card.getBoundingClientRect();
    drag.ghost = drag.card.cloneNode(true); drag.ghost.className = "cand drag-ghost"; drag.ghost.style.width = r.width + "px";
    document.body.appendChild(drag.ghost); document.body.classList.add("dragging");
    STATE.pk.selectedIndex = drag.i;
  }
  drag.ghost.style.transform = `translate(${e.clientX - 40}px,${e.clientY - 40}px) rotate(-3deg) scale(1.04)`;
  document.querySelectorAll(".slot.drag-over").forEach(x => x.classList.remove("drag-over"));
  document.elementFromPoint(e.clientX, e.clientY)?.closest(`.slot.droppable[data-player="${STATE.pk.turn}"]`)?.classList.add("drag-over");
}
function onPointerUp(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const d = drag; drag = null;
  if (!d.moved) return;
  suppressClickUntil = Date.now() + 350;
  d.ghost?.remove(); document.body.classList.remove("dragging");
  document.querySelectorAll(".slot.drag-over").forEach(x => x.classList.remove("drag-over"));
  const target = document.elementFromPoint(e.clientX, e.clientY)?.closest(`.slot.droppable[data-player="${STATE.pk.turn}"]`);
  if (target) P.assignSelectedPKRole(STATE.pk.turn, target.dataset.role);
  else { STATE.pk.selectedIndex = null; render(); }
}
if (typeof document !== "undefined") {
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove, { passive: false });
  document.addEventListener("pointerup", onPointerUp);
  document.addEventListener("pointercancel", onPointerUp);
}

actions({
  "pk.kind": v => { STATE.pkSetup.kind = v === "budget" ? "budget" : "random"; P.updatePKSetup("kind", STATE.pkSetup.kind); },
  "pk.opponent": v => P.updatePKSetup("opponent", v === "cpu" ? "cpu" : "local"),
  "pk.difficulty": v => P.updatePKSetup("difficulty", v === "casual" ? "casual" : "strategic"),
  "pk.start": () => P.startPK(),
  "pk.pick": v => {
    if (Date.now() < suppressClickUntil) return;
    const i = Number(v), pk = STATE.pk; if (!pk || pk.revealing || P.isCPUTurn()) return;
    pk.selectedIndex = i; render();
    openRoleSheet(i);
  },
  "pk.assign": v => { const pk = STATE.pk; if (pk) P.assignSelectedPKRole(pk.turn, v); closeSheet(); },
  "pk.slot": v => {
    const [n, role] = [Number(v.split("|")[0]), v.slice(v.indexOf("|") + 1)];
    if (STATE.pk?.selectedIndex !== null && STATE.pk?.selectedIndex !== undefined) P.assignSelectedPKRole(n, role);
  },
  "pk.skip": () => P.skipPKPair(),
  "pk.finish": async () => {
    const pk = STATE.pk, p = pk[`p${pk.turn}`];
    if (!p.team.length) return P.finishBudgetTeam();
    const empty = p.roles.length - p.team.length;
    if (await confirmSheet({ title: t("finishTeam"), body: t("finishConfirm", { n: empty, money: p.budget }), ok: t("finishTeam") })) P.finishBudgetTeam();
  },
  "pk.sell": async v => {
    const n = Number(v.split("|")[0]), role = v.slice(v.indexOf("|") + 1), hit = STATE.pk[`p${n}`].team.find(x => x.role === role);
    if (hit && await confirmSheet({ title: t("sellTitle", { name: displayName(hit.character) }), body: t("sellConfirm", { n: hit.price }), ok: t("sellCharacter") })) P.sellBudgetCharacter(n, role);
  },
  "pk.end": () => P.endPKEarly(),
});
inputs({
  "pk.series": (value, el) => P.updatePKSetup(el.dataset.which, value),
});
