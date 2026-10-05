import { STATE } from "../../core/state.js";
import { t, displaySeries } from "../../core/i18n.js";
import { getSeries } from "../../core/roster.js";
import { esc, icon, act } from "../parts.js";
import { screen, actions, go } from "../shell.js";
import { openSetup, fusionInProgress } from "../../game/fusion.js";
import { openPKSetup, pkInProgress, resumePK, pkPlayerLabel } from "../../game/pk.js";
import { aiConfigured } from "../../ai/referee.js";
import { rollDraftPair } from "../../game/fusion.js";

function modeCard({ ic, tone, title, desc, actName, v, badge = "" }) {
  return `<button class="mode-card tone-${tone}" ${act(actName, v)}><span class="mode-ic">${icon(ic)}</span><span class="mode-text"><strong>${esc(title)}${badge}</strong><small>${esc(desc)}</small></span><span class="mode-go">${icon("chevron")}</span></button>`;
}
function resumeCard() {
  if (STATE.game && STATE.game.kind === "standard" && STATE.game.remaining?.length) {
    const g = STATE.game, done = g.assignments.length;
    return `<button class="resume-card" ${act("home.resumeDraft")}><span class="resume-ic tone-violet">${icon("fusion")}</span><span><small>${esc(t("continueGame"))}</small><strong>${esc(t("standard"))}</strong><em>${esc(t("traitsProgress", { n: done, total: g.total || done + g.remaining.length }))}</em></span><span class="resume-bar" style="--p:${(done / (g.total || 1)) * 100}%"></span>${icon("chevron")}</button>`;
  }
  if (pkInProgress()) {
    const pk = STATE.pk, s1 = getSeries(pk.p1.seriesId), s2 = getSeries(pk.p2.seriesId);
    const filled = pk.p1.team.length + pk.p2.team.length, total = pk.p1.roles.length + pk.p2.roles.length;
    return `<button class="resume-card" ${act("home.resumePK")}><span class="resume-ic tone-rose">${icon(pk.kind === "budget" ? "coin" : pk.kind === "auction" ? "gavel" : "swords")}</span><span><small>${esc(t("continueGame"))}</small><strong>${esc(displaySeries(s1))} <i>vs</i> ${esc(displaySeries(s2))}</strong><em>${esc(t("turnOf", { name: pkPlayerLabel(pk.turn) }))} · ${filled}/${total}</em></span><span class="resume-bar" style="--p:${(filled / total) * 100}%"></span>${icon("chevron")}</button>`;
  }
  return "";
}

screen("home", {
  title: () => "",
  render: ({ first }) => `<div class="home${first ? " stagger" : ""}">
    <section class="hero"><h1>${esc(t("heroTitle"))}</h1><p>${esc(t("subtitle"))}</p></section>
    ${resumeCard()}
    <div class="group-label">${icon("fusion")}<span>${esc(t("fusionSection"))}</span></div>
    <div class="mode-list">
      ${modeCard({ ic: "fusion", tone: "violet", title: t("standard"), desc: t("standardDesc"), actName: "home.setup", v: "standard" })}
      ${modeCard({ ic: "bolt", tone: "blue", title: t("quick"), desc: t("quickDesc"), actName: "home.setup", v: "quick" })}
    </div>
    <div class="group-label">${icon("swords")}<span>${esc(t("pk"))}</span></div>
    <div class="mode-list">
      ${modeCard({ ic: "swords", tone: "rose", title: t("randomPK"), desc: t("pkDesc"), actName: "home.pk", v: "random" })}
      ${modeCard({ ic: "coin", tone: "green", title: t("budgetPK"), desc: t("budgetPKDesc"), actName: "home.pk", v: "budget" })}
      ${modeCard({ ic: "gavel", tone: "gold", title: t("auctionPK"), desc: t("auctionPKDesc"), actName: "home.pk", v: "auction", badge: `<span class="badge new">${esc(t("newBadge"))}</span>` })}
    </div>
    <button class="ai-strip${aiConfigured() ? " on" : ""}" ${act("home.ai")}>${icon("whistle")}<span><strong>${esc(t(aiConfigured() ? "aiRefereeOn" : "aiRefereeOff"))}</strong><small>${esc(t(aiConfigured() ? "aiRefereeOnDesc" : "aiRefereeOffDesc"))}</small></span>${icon("chevron")}</button>
  </div>`,
});

actions({
  "home.setup": v => openSetup(v),
  "home.pk": v => openPKSetup(v),
  "home.ai": () => go("settings", { section: "ai" }),
  "home.resumeDraft": () => { go("draft"); const g = STATE.game; if (g && !g.revealing && !g.left) rollDraftPair(); },
  "home.resumePK": () => resumePK(),
});
