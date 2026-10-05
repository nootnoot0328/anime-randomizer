import { MODES } from "../../data/game.js";
import { STATE } from "../../core/state.js";
import { t, charSeries, traitLabel, displayName, displaySeries, secondaryName } from "../../core/i18n.js";
import { allSeries, selectedPool, applyGenderFilter, excludedUnknownCount, characterIdentityCount, getSeries } from "../../core/roster.js";
import { buildFusionPrompt } from "../../core/prompts.js";
import { isFusionSaved } from "../../core/history.js";
import { esc, icon, act, avatar, seg, chip, sectionHead } from "../parts.js";
import { traitIcon } from "../icons.js";
import { screen, actions, go, openSheet, sheetHead, closeSheet, copyText, confirmSheet } from "../shell.js";
import * as F from "../../game/fusion.js";
import { aiConfigured } from "../../ai/referee.js";
import { bringToLife, cancelSheet, rewritesLeft, sheetPromptFor } from "../../ai/sheet.js";
import { attributes } from "../../game/cpu.js";

/* ---------------------------------------------------------------- setup */
function seriesTile(s) {
  const on = STATE.selectedSeries.has(s.id), n = applyGenderFilter(s.chars).length;
  return `<button class="series-tile${on ? " on" : ""}" aria-pressed="${on}" ${act("fusion.series", s.id)}><span class="tick">${icon("check")}</span><strong>${esc(displaySeries(s))}</strong><small>${esc(t("charCount", { n }))}</small></button>`;
}
screen("setup", {
  title: () => t(STATE.setupKind === "quick" ? "quick" : "standard"),
  render: ({ first }) => {
    const series = allSeries(), pool = selectedPool(), excluded = excludedUnknownCount(), problem = F.setupProblem();
    const allOn = STATE.selectedSeries.size === series.length, traits = MODES[STATE.selectedMode];
    return `<div class="setup${first ? " stagger" : ""}">
      ${seg([{ v: "standard", label: t("standard"), icon: "fusion" }, { v: "quick", label: t("quick"), icon: "bolt" }], STATE.setupKind, "fusion.kind", "seg-lg")}
      <p class="lede">${esc(t(STATE.setupKind === "quick" ? "quickDesc" : "standardDesc"))}</p>
      <section class="card">
        ${sectionHead(t("chooseMode"))}
        <div class="chips">${Object.keys(MODES).map(m => chip(t(m), STATE.selectedMode === m, "fusion.mode", m)).join("")}</div>
      </section>
      <section class="card">
        ${sectionHead(t("chooseSeries"), `<button class="link" ${act("fusion.allSeries", allOn ? "0" : "1")}>${esc(t(allOn ? "clearAll" : "selectAll"))}</button>`, t("seriesPicked", { n: STATE.selectedSeries.size, total: series.length }))}
        <div class="series-grid">${series.map(seriesTile).join("")}</div>
      </section>
      <section class="card">
        ${sectionHead(t("selectTraits"), `<button class="link" ${act("fusion.allTraits", STATE.selectedTraits.size === traits.length ? "0" : "1")}>${esc(t(STATE.selectedTraits.size === traits.length ? "clearAll" : "selectAll"))}</button>`, t("traitsPicked", { n: STATE.selectedTraits.size, total: traits.length }))}
        <div class="chips">${traits.map(tr => chip(traitLabel(tr), STATE.selectedTraits.has(tr), "fusion.trait", tr)).join("")}</div>
      </section>
      <section class="card">
        ${sectionHead(t("rules"))}
        <label class="field-label">${esc(t("gender"))}</label>
        ${seg([{ v: "all", label: t("all") }, { v: "male", label: t("maleOnly") }, { v: "female", label: t("femaleOnly") }], STATE.genderFilter, "fusion.gender")}
        ${excluded ? `<p class="hint">${esc(t("genderExcluded", { n: excluded }))}</p>` : ""}
        <label class="field-label">${esc(t("poolBehavior"))}</label>
        ${seg([{ v: "repeat", label: t("allowRepeats") }, { v: "discard", label: t("discardChosen") }], STATE.poolMode, "fusion.pool")}
        ${STATE.poolMode === "discard" ? `<p class="hint">${esc(t("discardDesc"))}</p>` : ""}
      </section>
    </div>
    <div class="dock"><div class="dock-info"><strong>${esc(t("poolSummary", { n: characterIdentityCount(pool) }))}</strong><small class="${problem ? "bad" : ""}">${esc(problem ? t(problem) : t("traitsPicked", { n: STATE.selectedTraits.size, total: traits.length }))}</small></div><button class="btn primary" ${act("fusion.start")} ${problem ? 'aria-disabled="true"' : ""}>${icon(STATE.setupKind === "quick" ? "bolt" : "play")}<span>${esc(t(STATE.setupKind === "quick" ? "quickStart" : "start"))}</span></button></div>`;
  },
});

/* ---------------------------------------------------------------- draft */
function bigCard(c, side, g) {
  if (!c) return `<div class="pick-card ghost"></div>`;
  const sub = secondaryName(c);
  return `<button class="pick-card${g.revealing ? " shuffling" : ""}${g.settled ? " settled" : ""}" ${act("fusion.choose", side)} ${g.revealing ? 'aria-disabled="true"' : ""}>
    <span class="pick-art">${avatar(c, "av-fill")}</span>
    <span class="pick-meta"><strong>${esc(displayName(c))}</strong><small>${esc(charSeries(c))}${sub ? ` · ${esc(sub)}` : ""}</small></span></button>`;
}
screen("draft", {
  title: () => t(STATE.game?.mode || STATE.selectedMode),
  render: () => {
    const g = STATE.game; if (!g || !g.remaining) return `<div class="empty">${esc(t("noGame"))}</div>`;
    const done = g.assignments.length, total = g.total || done + g.remaining.length;
    const left = g.revealing ? (g.tempLeft || g.left) : g.left, right = g.revealing ? (g.tempRight || g.right) : g.right;
    return `<div class="draft">
      <div class="progress-row"><div class="meter"><i style="width:${(done / total) * 100}%"></i></div><span class="mono">${done}/${total}</span></div>
      <div class="draft-head"><h2 class="${g.revealing ? "pulse-text" : ""}">${esc(g.revealing ? t("revealing") : t("chooseOne"))}</h2>
        <button class="btn ghost sm" ${act("fusion.skip")} ${g.revealing || g.skips <= 0 ? 'aria-disabled="true"' : ""}>${icon("refresh")}<span>${esc(t("skip"))}</span><b class="count">${g.skips}</b></button></div>
      <div class="duel">${bigCard(left, "left", g)}<span class="vs-badge${g.revealing ? " spin" : ""}">VS</span>${bigCard(right, "right", g)}</div>
      ${done ? `<div class="built"><div class="mini-label">${esc(t("builtSoFar"))}</div><div class="built-strip">${g.assignments.map((a, i) => `<div class="built-item" data-key="b${i}">${avatar(a.character, "av-sm")}<span><small>${esc(traitLabel(a.trait))}</small><b>${esc(displayName(a.character))}</b></span></div>`).join("")}</div></div>` : ""}
      <div class="mini-label">${esc(t("remaining"))}</div>
      <div class="chips quiet">${g.remaining.map(x => `<span class="chip static" data-key="${esc(x)}">${esc(traitLabel(x))}</span>`).join("")}</div>
    </div>`;
  },
  leave: () => F.cancelFusionTimers(),
});
function openTraitSheet(c) {
  const g = STATE.game;
  openSheet(`${sheetHead(t("takeFromTitle", { name: displayName(c) }), charSeries(c))}
    <div class="sheet-hero">${avatar(c, "av-xl")}</div>
    <div class="trait-grid">${g.remaining.map(tr => `<button class="trait-btn" ${act("fusion.assign", tr)}>${esc(traitLabel(tr))}</button>`).join("")}</div>`,
  { onClose: () => { if (STATE.game) STATE.game.selected = null; } });
}

/* ---------------------------------------------------------------- quick */
screen("quickreveal", {
  title: () => t("quickReveal"),
  render: () => {
    const q = STATE.quickReveal; if (!q) return `<div class="empty">${esc(t("noGame"))}</div>`;
    return `<div class="quick">
      <div class="quick-head">${icon("bolt", "zap")}<h2 class="pulse-text">${esc(t("revealing"))}</h2></div>
      <div class="reveal-list">${q.traits.map((tr, idx) => {
        const hit = q.assignments.find(a => a.trait === tr), active = idx === q.index && !hit, c = hit ? hit.character : (active ? q.currentDisplay : null);
        return `<div class="reveal-row${active ? " active" : ""}${hit ? " done" : ""}" data-key="${esc(tr)}"><span class="r-trait">${esc(traitLabel(tr))}</span><span class="r-who">${c ? avatar(c, "av-sm") : `<span class="av av-sm av-empty"></span>`}<b>${esc(c ? displayName(c) : "…")}</b></span></div>`;
      }).join("")}</div></div>`;
  },
  leave: () => { F.cancelFusionTimers(); STATE.quickReveal = null; },
});

/* ---------------------------------------------------------------- result */
const SHEET_LOADING = ["sheetLoading1", "sheetLoading2", "sheetLoading3", "sheetLoading4"];
// traits the computer already rates, shown as real bars (no invented numbers for the rest)
const RATED = { Power: "power", "Fighting Ability": "power", Intelligence: "intel" };

function sheetPanel(g) {
  const sh = g.sheet || {};
  if (sh.status === "loading") {
    return `<section class="ref-card loading" data-key="sheet-loading"><div class="whistle">${icon("sparkles")}</div><h3>${esc(t("sheetThinking"))}</h3>
      <p class="cycler">${SHEET_LOADING.map((k, i) => `<span style="--i:${i}">${esc(t(k))}</span>`).join("")}</p>
      <div class="skeleton"><i></i><i></i><i></i></div><button class="btn ghost sm" ${act("sheet.cancel")}>${esc(t("cancel"))}</button></section>`;
  }
  if (sh.data) return "";
  if (sh.status === "error") {
    const fix = ["badKey", "noProvider", "scope"].includes(sh.code);
    return `<section class="ref-card error" data-key="sheet-error">${icon("info", "err-ic")}<h3>${esc(t("sheetError_" + (sh.code || "server")))}</h3>${sh.detail && !["unreadable", "scope"].includes(sh.code) ? `<p class="hint">${esc(sh.detail)}</p>` : ""}
      <div class="row-actions"><button class="btn primary" ${act("sheet.make")}>${icon("refresh")}<span>${esc(t("tryAgain"))}</span></button>${fix ? `<button class="btn ghost" ${act("sheet.setup")}>${esc(t("openSettings"))}</button>` : `<button class="btn ghost" ${act("sheet.copy")}>${icon("copy")}<span>${esc(t("copyStoryShort"))}</span></button>`}</div></section>`;
  }
  if (!aiConfigured()) {
    return `<section class="ref-card setup" data-key="sheet-setup">${icon("sparkles", "big-ic")}<h3>${esc(t("sheetSetupTitle"))}</h3><p>${esc(t("sheetSetupBody"))}</p>
      <div class="row-actions"><button class="btn primary" ${act("sheet.setup")}>${esc(t("setUp"))}</button><button class="btn ghost" ${act("sheet.copy")}>${icon("copy")}<span>${esc(t("copyStoryShort"))}</span></button></div></section>`;
  }
  return `<section class="ref-card ready" data-key="sheet-ready"><button class="call-btn" ${act("sheet.make")}>${icon("sparkles")}<span><strong>${esc(t("bringToLife"))}</strong><small>${esc(t("bringToLifeSub"))}</small></span></button></section>`;
}

function idCard(g) {
  const sh = g.sheet, d = sh.data;
  const meta = [t("sheetSaved"), sh.lang && sh.lang !== STATE.lang ? t("writtenIn_" + sh.lang) : ""].filter(Boolean).join(" · ");
  return `<section class="id-card${sh.fresh ? " fresh" : ""}" data-key="id-card">
    <div class="eyebrow">${esc(t(g.mode))}</div>
    <h1>${esc(d.name)}</h1>${d.title ? `<p class="id-title">${esc(d.title)}</p>` : ""}
    ${d.summary ? `<p class="id-summary">${esc(d.summary)}</p>` : ""}
    <p class="final-note">${icon("check")}<span>${esc(meta)}</span></p>
    ${sh.error ? `<p class="final-note warn">${icon("info")}<span>${esc(t("rewriteFailed"))} ${esc(t("sheetError_" + sh.error))}</span></p>` : ""}
  </section>`;
}

function storyBlocks(g) {
  const d = g.sheet.data; let out = "";
  if (d.backstory.length) out += `<section class="story" data-key="story"><div class="ref-label">${icon("scroll")}<span>${esc(t("backstory"))}</span></div>${d.backstory.map(p => `<p>${esc(p)}</p>`).join("")}</section>`;
  if (d.dialogue.length) out += `<section class="voice" data-key="voice"><div class="ref-label">${icon("quote")}<span>${esc(t("inTheirWords"))}</span></div>${d.dialogue.map((q, i) => `<blockquote style="--d:${i * 0.15}s">${esc(q)}</blockquote>`).join("")}</section>`;
  if (d.signature) out += `<section class="signature" data-key="signature"><div class="ref-label">${icon("bolt")}<span>${esc(t("signatureMove"))}</span></div><div class="sig-card"><strong>${esc(d.signature.name)}</strong>${d.signature.text ? `<p>${esc(d.signature.text)}</p>` : ""}</div></section>`;
  return out;
}

function traitRows(g) {
  const lines = g.sheet?.data?.traits || {};
  return `<div class="sheet-list">${g.assignments.map(a => {
    const line = lines[a.trait];
    return `<div class="trait-row${line ? " has-line" : ""}">${avatar(a.character, "av-md")}<span class="tr-text"><small>${traitIcon(a.trait, "tr-ic")}${esc(traitLabel(a.trait))}</small><strong>${esc(displayName(a.character))}</strong><em>${esc(displaySeries(getSeries(a.character.seriesId) || a.character))}</em>${line ? `<p class="tr-line">${esc(line)}</p>` : ""}</span></div>`;
  }).join("")}</div>`;
}

function ratingsBlock(g) {
  const rows = g.assignments.filter(a => RATED[a.trait]);
  if (!rows.length) return "";
  return `<section class="ratings" data-key="ratings"><div class="ref-label">${icon("cpu")}<span>${esc(t("ratings"))}</span></div>
    ${rows.map(a => { const v = attributes(a.character)[RATED[a.trait]] ?? 0; return `<div class="rate-row"><span class="rate-name">${traitIcon(a.trait, "tr-ic")}${esc(traitLabel(a.trait))}<small>${esc(t("fromName", { name: displayName(a.character) }))}</small></span><span class="rate-bar"><i style="width:${Math.max(0, Math.min(10, v)) * 10}%"></i></span><b>${v}/10</b></div>`; }).join("")}
    <p class="hint">${esc(t("ratingsNote"))}</p></section>`;
}

/** The fusion on screen: the one just played, or one reopened from History. */
const current = () => (STATE.screen === "fusionview" ? STATE.viewFusion : STATE.game);

screen("result", { title: () => t("complete"), render: ctx => resultView(STATE.game, ctx) });
screen("fusionview", { title: () => STATE.viewFusion?.sheet?.data?.name || t(STATE.viewFusion?.mode || "fusions"), render: ctx => resultView(STATE.viewFusion, ctx) });

function resultView(g, { first }) {
    if (!g || !g.assignments) return `<div class="empty">${esc(t("noGame"))}</div>`;
    const saved = g.fromHistory || STATE.resultSaved || isFusionSaved(g);
    const sh = g.sheet, d = sh?.data, loading = sh?.status === "loading";
    const left = rewritesLeft(g);
    return `<div class="result${first ? " stagger" : ""}">
      ${d && !loading ? idCard(g) : `<section class="result-hero"><span class="burst">${icon(g.kind === "quick" ? "bolt" : "sparkles")}</span><div class="eyebrow">${esc(t(g.mode))}</div><h1>${esc(t("complete"))}</h1></section>`}
      ${sheetPanel(g)}
      ${d && !loading ? storyBlocks(g) : ""}
      ${d && !loading ? `<div class="ref-label traits-label">${icon("fusion")}<span>${esc(t("traitSources"))}</span></div>` : ""}
      ${traitRows(g)}
      ${ratingsBlock(g)}
      <div class="stack-actions">
        <button class="btn ${d ? "secondary" : "primary"} lg" ${act("fusion.copy")}>${icon("image")}<span>${esc(t("copyPrompt"))}</span></button>
        <div class="row-actions">
          ${saved ? `<span class="btn done-pill">${icon("check")}<span>${esc(t("saved"))}</span></span>` : `<button class="btn secondary" ${act("fusion.save")}>${icon("save")}<span>${esc(t("saveHistory"))}</span></button>`}
          ${d && !loading ? (left > 0 ? `<button class="btn ghost" ${act("sheet.rewrite")}>${icon("refresh")}<span>${esc(t("rewriteLeft", { n: left }))}</span></button>` : `<span class="btn done-pill muted">${esc(t("rewriteUsed"))}</span>`) : ""}
          ${g.fromHistory ? "" : `<button class="btn ghost" ${act("fusion.again")}>${icon("refresh")}<span>${esc(t("playAgain"))}</span></button>`}
        </div>
        ${d ? "" : `<button class="btn ghost" ${act("sheet.copy")}>${icon("copy")}<span>${esc(t("copyStoryPrompt"))}</span></button>`}
        <p class="hint center">${esc(t("copyPromptHint"))}${d ? "" : " " + esc(t("copyStoryHint"))}</p>
      </div></div>`;
}

actions({
  "fusion.kind": v => F.setSetupKind(v),
  "fusion.series": v => F.toggleSeries(v),
  "fusion.allSeries": v => F.setAllSeries(v === "1"),
  "fusion.mode": v => F.selectMode(v),
  "fusion.trait": v => F.toggleTrait(v),
  "fusion.allTraits": v => F.setAllTraits(v === "1"),
  "fusion.gender": v => F.setGenderFilter(v),
  "fusion.pool": v => F.setPoolMode(v),
  "fusion.start": () => F.startSetup(),
  "fusion.choose": v => { const c = F.chooseCharacter(v); if (c) openTraitSheet(c); },
  "fusion.assign": v => { F.assignTrait(v); closeSheet(); },
  "fusion.skip": () => F.skipRound(),
  "fusion.copy": () => { const g = current(); copyText(buildFusionPrompt(g.assignments, g.mode, g.promptScenario, STATE.lang), t("imagePrompt")); },
  "fusion.save": () => F.saveResult(),
  "fusion.again": () => go("setup", { dir: "back" }),
  "sheet.make": () => bringToLife(current()),
  "sheet.cancel": () => cancelSheet(),
  "sheet.copy": () => { const g = current(); if (g) copyText(sheetPromptFor(g, STATE.lang, "text"), t("copyStoryPrompt")); },
  "sheet.setup": () => go("settings", { section: "ai" }),
  "sheet.rewrite": async () => {
    const g = current(); if (!g?.sheet?.data || rewritesLeft(g) <= 0) return;
    if (await confirmSheet({ title: t("rewriteTitle"), body: t("rewriteBody"), ok: t("rewrite") })) bringToLife(g, { rewrite: true });
  },
});
