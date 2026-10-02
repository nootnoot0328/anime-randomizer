import { STATE } from "../../core/state.js";
import { t, displayName, displaySeries, roleLabel, promptCharacterName } from "../../core/i18n.js";
import { getSeries, isTraitorRole } from "../../core/roster.js";
import { buildPKJudgePrompt, buildPKBattleImagePrompt } from "../../core/prompts.js";
import { BATTLEFIELDS } from "../../data/game.js";
import { esc, icon, act, avatar } from "../parts.js";
import { screen, actions, go, copyText, confirmSheet, render } from "../shell.js";
import { aiConfigured, judge, cancelJudge } from "../../ai/referee.js";
import { pkPlayerLabel, rematch, openPKSetup } from "../../game/pk.js";
import { deleteEntry } from "../../core/history.js";

const LOADING_LINES = ["refLoading1", "refLoading2", "refLoading3", "refLoading4"];
const BEAT_ICON = { opening: "flag", clash: "swords", "turning-point": "refresh", betrayal: "x", endgame: "trophy" };

/** Which match the report is showing: the live one, or one opened from History. */
function currentMatch() { return STATE.screen === "battle" ? STATE.viewBattle : STATE.pk; }

function matchupRows(pk, verdict) {
  const n = Math.max(pk.p1.roles.length, pk.p2.roles.length), rows = [];
  for (let i = 0; i < n; i++) {
    const r1 = pk.p1.roles[i], r2 = pk.p2.roles[i];
    const a = r1 && pk.p1.team.find(x => x.role === r1), b = r2 && pk.p2.team.find(x => x.role === r2);
    const edge = verdict?.matchups?.[i]?.edge ?? null, note = verdict?.matchups?.[i]?.note || "";
    const traitor = (r1 && isTraitorRole(r1)) || (r2 && isTraitorRole(r2));
    const side = (x, role, n) => x ? `<div class="mu-side s${n}${edge === n ? " win" : ""}">${avatar(x.character, "av-sm")}<span><small>${esc(roleLabel(role))}</small><b>${esc(displayName(x.character))}</b></span></div>`
      : `<div class="mu-side s${n} empty"><span class="av av-sm av-empty"></span><span><small>${esc(role ? roleLabel(role) : "")}</small><b>${esc(t("emptySlot"))}</b></span></div>`;
    rows.push(`<div class="mu-row${traitor ? " traitor" : ""}${edge === 1 ? " e1" : edge === 2 ? " e2" : ""}" data-key="mu${i}">${side(a, r1, 1)}<span class="mu-mid">${edge === 1 ? icon("back") : edge === 2 ? icon("chevron") : traitor ? icon("x") : "<i>vs</i>"}</span>${side(b, r2, 2)}${note ? `<p class="mu-note">${esc(note)}</p>` : ""}</div>`);
  }
  return rows.join("");
}

function verdictBlock(pk, ref) {
  const v = ref.verdict, fresh = ref.fresh;
  const winnerLabel = v.winner === 0 ? t("draw") : t("wins", { name: pkPlayerLabel(v.winner, pk) });
  const winSeries = v.winner ? displaySeries(getSeries(pk[`p${v.winner}`].seriesId)) : "";
  const mvpChar = v.mvp ? [...pk.p1.team, ...pk.p2.team].find(x => promptCharacterName(x.character, ref.lang) === v.mvp.name)?.character : null;
  const beats = v.commentary.map((b, i) => `<li class="beat b-${esc(b.beat)}" style="--d:${fresh ? i * 0.9 + 0.2 : 0}s" data-key="beat${i}"><span class="beat-ic">${icon(BEAT_ICON[b.beat] || "mic")}</span><div><small>${esc(t("beat_" + b.beat.replace("-", "_")))}</small><p>${esc(b.text)}</p></div></li>`).join("");
  const after = fresh ? v.commentary.length * 0.9 + 0.5 : 0;
  return `<section class="ref-done${fresh ? " fresh" : ""}" data-key="ref-done">
    ${v.commentary.length ? `<div class="ref-label">${icon("mic")}<span>${esc(t("commentary"))}</span></div><ol class="beats">${beats}</ol>` : ""}
    <div class="verdict w${v.winner}" style="--d:${after}s">
      <div class="verdict-top">${icon(v.winner ? "trophy" : "flag", "v-ic")}<div><small>${esc(t("refereeCall"))}</small><h2>${esc(winnerLabel)}</h2>${winSeries ? `<em>${esc(winSeries)}</em>` : ""}</div><span class="margin m-${esc(v.margin)}">${esc(t("margin_" + v.margin.replace("-", "_")))}</span></div>
      <p class="why">${esc(v.why)}</p>
      ${v.biggestFactor ? `<div class="factor"><small>${esc(t("biggestFactor"))}</small><p>${esc(v.biggestFactor)}</p></div>` : ""}
      ${v.mvp ? `<div class="mvp p${v.mvp.player}">${mvpChar ? avatar(mvpChar, "av-md") : icon("trophy")}<div><small>MVP · ${esc(pkPlayerLabel(v.mvp.player, pk))}</small><strong>${esc(mvpChar ? displayName(mvpChar) : v.mvp.name)}</strong>${v.mvp.reason ? `<p>${esc(v.mvp.reason)}</p>` : ""}</div></div>` : ""}
      <p class="final-note">${icon("info")}<span>${esc(t("verdictFinal"))}${ref.lang && ref.lang !== STATE.lang ? ` · ${esc(t("judgedIn_" + ref.lang))}` : ""}</span></p>
    </div></section>`;
}

function refereePanel(pk) {
  const ref = pk.referee || {};
  if (ref.verdict) return verdictBlock(pk, ref);
  if (ref.status === "loading") {
    const secs = Math.floor((Date.now() - (ref.startedAt || Date.now())) / 1000);
    return `<section class="ref-card loading" data-key="ref-loading"><div class="whistle">${icon("whistle")}</div><h3>${esc(t("refThinking"))}</h3>
      <p class="cycler">${LOADING_LINES.map((k, i) => `<span style="--i:${i}">${esc(t(k))}</span>`).join("")}</p>
      <div class="skeleton"><i></i><i></i><i></i></div><button class="btn ghost sm" ${act("battle.cancel")}>${esc(t("cancel"))}</button><span class="sr-only">${secs}</span></section>`;
  }
  if (ref.status === "error") {
    return `<section class="ref-card error" data-key="ref-error">${icon("info", "err-ic")}<h3>${esc(t("refError_" + (ref.code || "server")))}</h3>${ref.detail && ref.code !== "unreadable" ? `<p class="hint">${esc(ref.detail)}</p>` : ""}
      <div class="row-actions"><button class="btn primary" ${act("battle.judge")}>${icon("refresh")}<span>${esc(t("tryAgain"))}</span></button>${ref.code === "badKey" || ref.code === "noProvider" ? `<button class="btn ghost" ${act("battle.setup")}>${esc(t("openSettings"))}</button>` : ""}</div></section>`;
  }
  if (!aiConfigured()) {
    return `<section class="ref-card setup" data-key="ref-setup">${icon("whistle", "big-ic")}<h3>${esc(t("refSetupTitle"))}</h3><p>${esc(t("refSetupBody"))}</p>
      <div class="row-actions"><button class="btn primary" ${act("battle.setup")}>${esc(t("setUp"))}</button><button class="btn ghost" ${act("battle.copyJudge")}>${icon("copy")}<span>${esc(t("copyJudgeShort"))}</span></button></div></section>`;
  }
  return `<section class="ref-card ready" data-key="ref-ready"><button class="call-btn" ${act("battle.judge")}>${icon("whistle")}<span><strong>${esc(t("callReferee"))}</strong><small>${esc(t("callRefereeSub"))}</small></span></button></section>`;
}

/** The finished-match screen (used by the live PK screen and by History). */
export function battleReport(pk, { first } = {}) {
  const field = BATTLEFIELDS[pk.battlefieldSeriesId], fieldSeries = getSeries(pk.battlefieldSeriesId);
  const s1 = getSeries(pk.p1.seriesId), s2 = getSeries(pk.p2.seriesId), v = pk.referee?.verdict;
  const banner = (n, s) => `<div class="fo-team p${n}${v && v.winner === n ? " won" : v && v.winner && v.winner !== n ? " lost" : ""}"><span class="team-dot"></span><strong>${esc(pkPlayerLabel(n, pk))}</strong><small>${esc(displaySeries(s))}</small>${pk.kind === "budget" ? `<em>$${pk[`p${n}`].budget ?? 0} ${esc(t("remainingBudget"))}</em>` : ""}</div>`;
  return `<div class="report${first ? " stagger" : ""}">
    <section class="faceoff" data-key="faceoff"><div class="eyebrow">${esc(t(pk.kind === "budget" ? "budgetPK" : "randomPK"))}</div>
      <div class="fo-row">${banner(1, s1)}<span class="fo-vs">VS</span>${banner(2, s2)}</div>
      ${field ? `<details class="field"><summary>${icon("globe")}<span>${esc(t("battlefield"))}: ${esc(displaySeries(fieldSeries))}</span></summary><p>${esc(field[STATE.lang] || field.en)}</p></details>` : ""}
    </section>
    ${refereePanel(pk)}
    <section class="card matchups" data-key="matchups"><div class="sec-head"><div><h2>${esc(t("roleMatchups"))}</h2></div></div>${matchupRows(pk, v)}</section>
    <div class="stack-actions" data-key="actions">
      ${pk.fromHistory ? "" : `<div class="row-actions"><button class="btn primary" ${act("battle.rematch")}>${icon("refresh")}<span>${esc(t("rematch"))}</span></button><button class="btn secondary" ${act("battle.new")}>${icon("swords")}<span>${esc(t("newMatch"))}</span></button></div>`}
      <div class="row-actions"><button class="btn ghost" ${act("battle.copyJudge")}>${icon("copy")}<span>${esc(t("copyJudgeShort"))}</span></button><button class="btn ghost" ${act("battle.copyImage")}>${icon("image")}<span>${esc(t("copyArtShort"))}</span></button></div>
      ${pk.fromHistory ? `<button class="btn ghost danger-text" ${act("battle.delete")}>${icon("trash")}<span>${esc(t("deleteEntry"))}</span></button>` : ""}
    </div></div>`;
}

screen("battle", {
  title: () => t("battleReport"),
  render: ctx => STATE.viewBattle ? battleReport(STATE.viewBattle, ctx) : `<div class="empty">${esc(t("noGame"))}</div>`,
});

// re-render the loading card once a second so the phrases cycle and the timer moves
setInterval(() => { const pk = currentMatch(); if (pk?.referee?.status === "loading" && (STATE.screen === "pk" || STATE.screen === "battle")) render(); }, 1000);

actions({
  "battle.judge": () => { const pk = currentMatch(); if (pk) judge(pk); },
  "battle.cancel": () => cancelJudge(),
  "battle.setup": () => go("settings", { section: "ai" }),
  "battle.copyJudge": () => { const pk = currentMatch(); copyText(buildPKJudgePrompt(pk, STATE.lang), t("pkJudgeTitle"), t("pkJudgeCopied")); },
  "battle.copyImage": () => { const pk = currentMatch(); copyText(buildPKBattleImagePrompt(pk, STATE.lang), t("pkBattleImageTitle"), t("pkBattleImageCopied")); },
  "battle.rematch": () => rematch(),
  "battle.new": () => openPKSetup(STATE.pk?.kind || "random"),
  "battle.delete": async () => {
    const pk = STATE.viewBattle; if (!pk) return;
    if (await confirmSheet({ title: t("deleteEntry"), body: t("deleteBody"), ok: t("deleteEntry"), danger: true })) { deleteEntry(pk.historyId); STATE.viewBattle = null; go("history", { dir: "back" }); }
  },
});
