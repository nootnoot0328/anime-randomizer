// The online room: the host shares a link and starts the match; the friend waits here until it begins.
import { STATE } from "../../core/state.js";
import { t, displaySeries } from "../../core/i18n.js";
import { getSeries } from "../../core/roster.js";
import { esc, icon, act } from "../parts.js";
import { screen, actions, go, render, copyText, confirmSheet, toast } from "../shell.js";
import * as P from "../../game/pk.js";
import { kindTitle } from "./pk.js";
import { createRoom, joinLink, leaveRoom, onlineConfigured } from "../../online/room.js";

const dot = on => `<span class="presence-dot${on ? " on" : ""}"></span>`;

function hostView(o) {
  const ps = STATE.pkSetup, series = getSeries(P.isSharedKind(ps.kind) ? ps.pool : ps.p1);
  const live = STATE.pk && P.isOnline(STATE.pk) && !P.pkOver(STATE.pk);
  const friendIn = o.presence.guest;
  return `<div class="room stagger">
    <section class="room-hero" data-key="hero"><div class="eyebrow">${esc(t("onlineMatch"))}</div><div class="room-code" aria-label="${esc(t("roomCode"))}">${[...o.code].map(ch => `<span>${esc(ch)}</span>`).join("")}</div>
      <p>${esc(t("roomShareHint"))}</p>
      <div class="row-actions"><button class="btn primary" ${act("online.share")}>${icon("share")}<span>${esc(t("shareLink"))}</span></button><button class="btn secondary" ${act("online.copy")}>${icon("copy")}<span>${esc(t("copyLink"))}</span></button></div></section>
    <section class="card room-people" data-key="people">
      <div class="person">${dot(o.status === "open")}<strong>${esc(t("you"))}</strong><small>${esc(t(o.status === "open" ? "onlineConnected" : "onlineConnecting"))}</small></div>
      <div class="person">${dot(friendIn)}<strong>${esc(t("friend"))}</strong><small>${esc(t(friendIn ? "friendJoined" : "friendWaiting"))}</small></div>
    </section>
    <section class="card" data-key="summary"><div class="meter-row"><span>${esc(t("modeLabel"))}</span><strong>${esc(t(kindTitle(ps.kind)))}</strong></div>
      <div class="meter-row"><span>${esc(t("series"))}</span><strong>${esc(displaySeries(series))}${!P.isSharedKind(ps.kind) ? ` · ${esc(displaySeries(getSeries(ps.p2) || series))}` : ""}</strong></div>
      <p class="hint">${esc(t("onlineYouArePlayer1"))}</p></section>
    <div class="stack-actions">
      ${live ? `<button class="btn primary lg" ${act("online.toMatch")}>${icon("swords")}<span>${esc(t("backToMatch"))}</span></button>`
        : `<button class="btn primary lg" ${act("online.start")} ${friendIn ? "" : 'aria-disabled="true"'}>${icon("swords")}<span>${esc(t(friendIn ? "startMatch" : "waitingForFriend"))}</span></button>`}
      <button class="btn ghost" ${act("online.leave")}>${icon("x")}<span>${esc(t("leaveRoom"))}</span></button>
    </div></div>`;
}

function guestView(o) {
  const failed = o.status === "failed";
  const line = failed ? t("roomFailed") : o.status !== "open" ? t("onlineConnecting") : o.presence.host ? t("waitingForHostStart") : t("hostOffline");
  return `<div class="room stagger">
    <section class="room-hero" data-key="hero"><div class="eyebrow">${esc(t("onlineMatch"))}</div><div class="room-code">${[...o.code].map(ch => `<span>${esc(ch)}</span>`).join("")}</div>
      <p class="${failed ? "bad" : ""}">${esc(line)}</p>${!failed && o.status !== "open" ? `<div class="skeleton"><i></i><i></i></div>` : ""}</section>
    <section class="card room-people" data-key="people">
      <div class="person">${dot(o.presence.host)}<strong>${esc(t("friend"))}</strong><small>${esc(t("roomHost"))}</small></div>
      <div class="person">${dot(o.status === "open")}<strong>${esc(t("you"))}</strong><small>${esc(t("onlineYouArePlayer2"))}</small></div>
    </section>
    <div class="stack-actions">${failed ? `<button class="btn primary" ${act("online.retry")}>${icon("refresh")}<span>${esc(t("tryAgain"))}</span></button>` : ""}
      <button class="btn ghost" ${act("online.leave")}>${icon("x")}<span>${esc(t("leaveRoom"))}</span></button></div></div>`;
}

screen("room", {
  title: () => t("onlineMatch"),
  render: () => {
    const o = STATE.online;
    if (!o) return `<div class="empty"><p>${esc(t("noRoom"))}</p><button class="btn primary" ${act("online.home")}>${esc(t("back"))}</button></div>`;
    return o.role === "host" ? hostView(o) : guestView(o);
  },
});

/** From PK setup with "Online friend": make (or reuse) a room and open it. */
export async function openOnlineRoom() {
  if (!onlineConfigured()) { toast(t("onlineNeedsServer")); go("settings", { section: "online" }); return; }
  if (STATE.online?.role === "host") { go("room"); return; }
  if (STATE.online?.role === "guest") leaveRoom();
  try { await createRoom(); go("room"); }
  catch (e) { toast(t("roomCreateFailed")); console.error(e); }
}

actions({
  "online.share": async () => {
    const url = joinLink();
    if (navigator.share) { try { await navigator.share({ title: "Anime Fusion", text: t("shareText", { code: STATE.online.code }), url }); return; } catch (e) { if (e?.name === "AbortError") return; } }
    copyText(url, t("copyLink"), t("linkCopied"));
  },
  "online.copy": () => copyText(joinLink(), t("copyLink"), t("linkCopied")),
  "online.start": () => {
    const o = STATE.online; if (!o?.presence.guest) return toast(t("friendWaiting"));
    STATE.pkSetup.opponent = "online";
    P.startPK();
  },
  "online.toMatch": () => go("pk"),
  "online.retry": () => { const o = STATE.online; if (!o) return; import("../../online/room.js").then(m => m.joinRoom(o.code, o.server)); render(); },
  "online.leave": async () => {
    if (await confirmSheet({ title: t("leaveRoom"), body: t("leaveRoomBody"), ok: t("leaveRoom"), danger: true })) {
      const wasGuest = STATE.online?.role === "guest";
      if (STATE.pk && P.isOnline(STATE.pk)) { P.cancelPKTimers(); if (wasGuest || !P.pkOver(STATE.pk)) STATE.pk = null; }
      leaveRoom(); go("home", { dir: "back" });
    }
  },
  "online.home": () => go("home", { dir: "back" }),
});
