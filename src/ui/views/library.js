import { STATE } from "../../core/state.js";
import { t, traitLabel, displayName, displaySeries, secondaryName } from "../../core/i18n.js";
import { getCharacter, getSeries, resolveCharacter, allSeries, applyCharacterPhases, characterPrice, phaseOptionsFor } from "../../core/roster.js";
import { entryType, battleFromEntry, deleteEntry } from "../../core/history.js";
const normalizeName = s => globalThis.AnimeFusionLogic.normalizeName(s);
import { esc, icon, act, avatar, seg, emptyState } from "../parts.js";
import { screen, actions, inputs, go, confirmSheet, openSheet, sheetHead, render } from "../shell.js";
import { pkPlayerLabel } from "../../game/pk.js";

/* ---------------------------------------------------------------- history */
function fusionCard(h) {
  const rows = h.assignments.map(a => {
    let name = a.name;
    if (STATE.lang === "zh" && a.name_zh) name = a.name_zh;
    if (STATE.lang === "ja" && a.name_ja) name = a.name_ja;
    const c = resolveCharacter(a.charId, a.phaseKey);
    if (c) name = displayName(c);
    return `<div class="h-row">${c ? avatar(c, "av-xs") : `<span class="av av-xs av-empty"></span>`}<small>${esc(traitLabel(a.trait))}</small><b>${esc(name)}</b></div>`;
  }).join("");
  return `<article class="h-card fusion" data-key="${esc(h.id)}"><header>${icon(h.kind === "quick" ? "bolt" : "fusion", "h-ic")}<div><strong>${esc(t(h.mode))}</strong><small>${esc(new Date(h.date).toLocaleString(STATE.lang === "zh" ? "zh-CN" : STATE.lang))}</small></div><button class="icon-btn sm" ${act("history.delete", h.id)} aria-label="${esc(t("deleteEntry"))}">${icon("trash")}</button></header><div class="h-rows">${rows}</div></article>`;
}
function battleCard(h) {
  const s1 = getSeries(h.p1.seriesId), s2 = getSeries(h.p2.seriesId), v = h.referee?.verdict, pk = { opponent: h.opponent };
  const result = v ? (v.winner === 0 ? t("draw") : t("wins", { name: pkPlayerLabel(v.winner, pk) })) : t("notJudged");
  const faces = side => side.team.slice(0, 6).map(x => { const c = resolveCharacter(x.id, x.phaseKey); return c ? avatar(c, "av-xs") : ""; }).join("");
  return `<article class="h-card battle" data-key="${esc(h.id)}" role="button" tabindex="0" ${act("history.open", h.id)}><header>${icon(h.kind === "budget" ? "coin" : "swords", "h-ic")}<div><strong>${esc(displaySeries(s1))} <i>vs</i> ${esc(displaySeries(s2))}</strong><small>${esc(new Date(h.date).toLocaleString(STATE.lang === "zh" ? "zh-CN" : STATE.lang))} · ${esc(t(h.kind === "budget" ? "budgetPK" : "randomPK"))}</small></div>${icon("chevron", "h-go")}</header>
    <div class="h-vs"><div class="faces p1${v?.winner === 1 ? " won" : ""}">${faces(h.p1)}</div><span class="h-result${v ? ` w${v.winner}` : " pending"}">${v ? icon(v.winner ? "trophy" : "flag") : icon("whistle")}<span>${esc(result)}</span></span><div class="faces p2${v?.winner === 2 ? " won" : ""}">${faces(h.p2)}</div></div></article>`;
}
screen("history", {
  title: () => t("history"),
  render: ({ first }) => {
    const f = STATE.historyFilter, list = STATE.history.filter(h => f === "all" || entryType(h) === f);
    const counts = { fusion: STATE.history.filter(h => entryType(h) === "fusion").length, battle: STATE.history.filter(h => entryType(h) === "battle").length };
    return `<div class="history${first ? " stagger" : ""}">
      ${seg([{ v: "all", label: `${t("all")} · ${STATE.history.length}` }, { v: "fusion", label: `${t("fusions")} · ${counts.fusion}` }, { v: "battle", label: `${t("battles")} · ${counts.battle}` }], f, "history.filter")}
      ${list.length ? `<div class="h-list">${list.map(h => entryType(h) === "battle" ? battleCard(h) : fusionCard(h)).join("")}</div>` : emptyState("history", t("noHistory"), `<button class="btn primary" ${act("history.play")}>${icon("play")}<span>${esc(t("startPlaying"))}</span></button>`)}
    </div>`;
  },
});
actions({
  "history.filter": v => { STATE.historyFilter = ["fusion", "battle"].includes(v) ? v : "all"; render(); },
  "history.open": id => { const h = STATE.history.find(x => x.id === id); if (!h) return; STATE.viewBattle = battleFromEntry(h); go("battle"); },
  "history.delete": async id => { if (await confirmSheet({ title: t("deleteEntry"), body: t("deleteBody"), ok: t("deleteEntry"), danger: true })) { deleteEntry(id); render(); } },
  "history.play": () => go("home", { dir: "tab" }),
});

/* ---------------------------------------------------------------- gallery */
function charTile(c) {
  return `<button class="char-tile" data-key="${esc(c.id + (c.phaseKey || ""))}" ${act("gallery.char", `${c.id}|${c.phaseKey || ""}`)}>${avatar(c, "av-fill")}<span><strong>${esc(displayName(c))}</strong><small>${esc(secondaryName(c) || (c.gender ? t(c.gender) : t("unspecified")))}</small></span></button>`;
}
function searchResults(q) {
  const n = normalizeName(q); if (!n) return null;
  return allSeries().flatMap(s => applyCharacterPhases(s.chars)).filter(c => [c.name_en, c.name_zh, c.name_ja].some(x => normalizeName(x).includes(n))).slice(0, 60);
}
screen("library", {
  title: () => t("gallery"),
  render: ({ first }) => {
    const hits = searchResults(STATE.gallerySearch);
    const search = `<label class="search">${icon("search")}<input id="gallerySearch" type="search" autocomplete="off" placeholder="${esc(t("searchCharacters"))}" value="${esc(STATE.gallerySearch)}" data-input="gallery.search">${STATE.gallerySearch ? `<button class="icon-btn sm" ${act("gallery.clear")} aria-label="${esc(t("clear"))}">${icon("x")}</button>` : ""}</label>`;
    if (hits) return `<div class="gallery">${search}<div class="mini-label">${esc(t("resultsCount", { n: hits.length }))}</div>${hits.length ? `<div class="char-grid">${hits.map(charTile).join("")}</div>` : `<div class="empty">${esc(t("noMatches"))}</div>`}</div>`;
    return `<div class="gallery${first ? " stagger" : ""}">${search}<div class="series-rows">${allSeries().map(s => {
      const chars = applyCharacterPhases(s.chars), sample = chars.slice(0, 4);
      return `<button class="series-row" data-key="${esc(s.id)}" ${act("gallery.series", s.id)}><span class="stack">${sample.map(c => avatar(c, "av-xs")).join("")}</span><span class="sr-text"><strong>${esc(displaySeries(s))}</strong><small>${esc(t("charCount", { n: chars.length }))}</small></span>${icon("chevron")}</button>`;
    }).join("")}</div></div>`;
  },
});
screen("serieslibrary", {
  title: () => displaySeries(getSeries(STATE.librarySeriesId)) || t("roster"),
  render: () => {
    const s = getSeries(STATE.librarySeriesId); if (!s) return `<div class="empty">${esc(t("noGame"))}</div>`;
    const chars = applyCharacterPhases(s.chars);
    return `<div class="gallery"><p class="lede">${esc(t("charCount", { n: chars.length }))}</p><div class="char-grid">${chars.map(charTile).join("")}</div></div>`;
  },
});
function characterSheet(c) {
  const forms = phaseOptionsFor(getCharacter(c.id));
  openSheet(`${sheetHead(displayName(c), displaySeries(getSeries(c.seriesId)))}
    <div class="char-sheet">${avatar(c, "av-portrait")}
      <dl><div><dt>English</dt><dd>${esc(c.name_en || "—")}</dd></div><div><dt>中文</dt><dd>${esc(c.name_zh || "—")}</dd></div><div><dt>日本語</dt><dd>${esc(c.name_ja || "—")}</dd></div>
      <div><dt>${esc(t("budgetPK"))}</dt><dd><span class="price t${characterPrice(c)}">$${characterPrice(c)}</span></dd></div>
      ${forms ? `<div><dt>${esc(t("characterPhases"))}</dt><dd>${forms.map(f => esc(f[STATE.lang] || f.en)).join(" · ")}</dd></div>` : ""}</dl></div>`);
}
actions({
  "gallery.series": id => { STATE.librarySeriesId = id; go("serieslibrary"); },
  "gallery.clear": () => { STATE.gallerySearch = ""; render(); document.getElementById("gallerySearch")?.focus(); },
  "gallery.char": v => { const [id, ph] = v.split("|"); const c = resolveCharacter(id, ph || null); if (c) characterSheet(c); },
});
inputs({ "gallery.search": v => { STATE.gallerySearch = v; render(); } });
