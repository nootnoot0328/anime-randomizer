// Online play: connects this phone to a room on the rooms server (rooms/worker.js).
// The host phone runs the match as usual and sends its state after every render; the friend's
// phone shows that state and sends its moves back as actions (see applyRemoteAction in pk.js).
import { STATE } from "../core/state.js";
import { app } from "../core/app.js";
import { readJSON, writeJSON } from "../core/util.js";
import { resolveCharacter } from "../core/roster.js";
import { saveBattle, attachVerdict } from "../core/history.js";
import { applyRemoteAction, isOnline, afterRestore } from "../game/pk.js";
import { serializeMatch, deserializeMatch } from "./sync.js";

const SERVER_KEY = "af_online_server", HOST_KEY = "af_online_host", GUEST_KEY = "af_online_guests";
const HOST_SESSION_HOURS = 48, PING_MS = 25_000;

const base = url => String(url || "").trim().replace(/\/+$/, "");
export function onlineServer() { return readJSON(SERVER_KEY, "") || ""; }
export function saveOnlineServer(url) { writeJSON(SERVER_KEY, base(url)); }
export function clearOnlineServer() { writeJSON(SERVER_KEY, ""); }
export const onlineConfigured = () => Boolean(onlineServer());

/** Check a rooms server address. @returns {{ok:boolean, code:string, detail?:string}} */
export async function testServer(url) {
  url = base(url);
  if (!/^https:\/\/[^/]+$/.test(url)) return { ok: false, code: "badUrl" };
  try {
    const r = await fetch(url + "/", { cache: "no-store" });
    const d = await r.json().catch(() => null);
    if (r.ok && d?.service === "anime-fusion-rooms") return { ok: true, code: "ok", detail: d.version };
    return { ok: false, code: d?.service ? "wrongService" : "unreachable" };
  } catch { return { ok: false, code: "unreachable" }; }
}

export function joinLink(o = STATE.online) {
  if (!o) return "";
  const srv = o.server.replace(/^https:\/\//, "");
  return `${location.origin}${location.pathname}?join=${o.code}&srv=${encodeURIComponent(srv)}`;
}

/* ---------------------------------------------------------------- session */
function session(role, code, server, token) {
  closeSocket();
  STATE.online = { role, code, server: base(server), token: token || null, status: "connecting", presence: { host: false, guest: false }, seq: 0, lastSent: "", retries: 0, saved: {}, error: null };
}

/** Host: make a new room on the configured server. */
export async function createRoom() {
  const server = onlineServer(); if (!server) throw new Error("noServer");
  const r = await fetch(server + "/rooms", { method: "POST" });
  const d = await r.json().catch(() => null);
  if (!r.ok || !d?.code) throw new Error(d?.error || "createFailed");
  session("host", d.code, server, d.hostToken);
  writeJSON(HOST_KEY, { code: d.code, server, token: d.hostToken, at: Date.now() });
  connect();
  return d.code;
}
/** Friend: join from a shared link. */
export function joinRoom(code, server) {
  const tokens = readJSON(GUEST_KEY, {}) || {};
  session("guest", code, server, tokens[code] || null);
  connect();
}
/** Host after a reload: reconnect to the room saved on this phone (if it isn't too old). */
export function resumeHostSession() {
  const s = readJSON(HOST_KEY, null);
  if (!s?.code || Date.now() - (s.at || 0) > HOST_SESSION_HOURS * 3600_000) return false;
  session("host", s.code, s.server, s.token);
  connect();
  return true;
}
/** Read ?join=CODE&srv=host from the address (a friend opening the shared link). */
export function joinFromURL() {
  const q = new URLSearchParams(location.search), code = (q.get("join") || "").toUpperCase(), srv = q.get("srv") || "";
  if (!/^[A-Z0-9]{5}$/.test(code) || !/^[a-z0-9.-]+$/i.test(srv)) return false;
  joinRoom(code, "https://" + srv);
  return true;
}
export function leaveRoom() {
  const o = STATE.online; if (!o) return;
  o.leaving = true;
  send({ t: "leave" });
  closeSocket();
  if (o.role === "host") writeJSON(HOST_KEY, null);
  if (o.role === "guest" && STATE.pk && isOnline(STATE.pk)) STATE.pk = null;
  STATE.online = null;
  if (o.role === "guest" && location.search) history.replaceState(null, "", location.pathname);
  app.render();
}

/* ---------------------------------------------------------------- socket */
let ws = null, pingTimer = null, retryTimer = null;
function closeSocket() {
  clearInterval(pingTimer); clearTimeout(retryTimer); pingTimer = retryTimer = null;
  if (ws) { ws.onclose = ws.onmessage = ws.onerror = null; try { ws.close(); } catch { } ws = null; }
}
function send(msg) { if (ws?.readyState === 1) ws.send(JSON.stringify(msg)); }
function connect() {
  const o = STATE.online; if (!o) return;
  const url = `${o.server.replace(/^http/, "ws")}/rooms/${o.code}/ws?role=${o.role}${o.token ? `&token=${encodeURIComponent(o.token)}` : ""}`;
  o.status = o.status === "open" ? "reconnecting" : o.status;
  let sock;
  try { sock = new WebSocket(url); } catch { return retry(); }
  ws = sock;
  sock.onmessage = e => { if (ws === sock) onMessage(e.data); };
  sock.onclose = e => {
    if (ws !== sock) return;
    ws = null; clearInterval(pingTimer);
    const o2 = STATE.online; if (!o2 || o2.leaving) return;
    // the room refused us (wrong token, full, gone): don't hammer it
    if (e.code === 1006 && o2.status === "connecting" && o2.retries >= 2) { o2.status = "failed"; app.render(); return; }
    retry();
  };
  pingTimer = setInterval(() => send({ t: "ping" }), PING_MS);
}
function retry() {
  const o = STATE.online; if (!o || o.leaving) return;
  o.status = "reconnecting"; o.retries++;
  app.render();
  retryTimer = setTimeout(connect, Math.min(15_000, 1000 * 2 ** Math.min(4, o.retries - 1)));
}
// phones drop sockets when the screen locks; reconnect straight away when the app comes back
if (typeof document !== "undefined") document.addEventListener("visibilitychange", () => {
  const o = STATE.online; if (document.visibilityState === "visible" && o && !o.leaving && !ws) { clearTimeout(retryTimer); connect(); }
});

function onMessage(raw) {
  let m; try { m = JSON.parse(raw); } catch { return; }
  const o = STATE.online; if (!o) return;
  if (m.t === "welcome") {
    o.status = "open"; o.retries = 0; o.presence = m.presence || o.presence; o.error = null;
    if (o.role === "guest") {
      if (m.guestToken) { o.token = m.guestToken; const t = readJSON(GUEST_KEY, {}) || {}; t[o.code] = m.guestToken; writeJSON(GUEST_KEY, t); }
      applyGuestState(m.state);
    } else {
      // after a reload the host's match is gone from memory: take it back from the room
      if (m.state && (!STATE.pk || !isOnline(STATE.pk))) { STATE.pk = deserializeMatch(m.state, resolveCharacter, 1); afterRestore(); }
      o.lastSent = ""; o.seq = m.seq || 0;
      broadcast();
    }
    app.render();
  } else if (m.t === "presence") {
    o.presence = { host: Boolean(m.host), guest: Boolean(m.guest) }; app.render();
  } else if (m.t === "state" && o.role === "guest") {
    applyGuestState(m.state);
  } else if (m.t === "action" && o.role === "host") {
    if (applyRemoteAction(m.action)) app.haptic("light");
  } else if (m.t === "error") {
    o.error = m.code;
    if (m.code === "host-away") app.toast(STATE.lang === "zh" ? "对方暂时离线" : STATE.lang === "ja" ? "相手が一時的にオフラインです" : "Your friend's host phone is offline");
    app.render();
  }
}

/* ---------------------------------------------------------------- state */
/** Host: after every render, send the match if it changed. */
export function broadcast() {
  const o = STATE.online; if (!o || o.role !== "host" || ws?.readyState !== 1) return;
  const pk = STATE.pk && isOnline(STATE.pk) ? STATE.pk : null;
  const pub = serializeMatch(pk, "public"), text = JSON.stringify(pub);
  if (text === o.lastSent) return;
  o.lastSent = text; o.seq++;
  send({ t: "state", seq: o.seq, full: serializeMatch(pk, "full"), public: pub });
}
app.afterRender = broadcast;
app.sendAction = action => {
  const o = STATE.online; if (!o || o.role !== "guest") return;
  if (ws?.readyState !== 1) { app.toast(STATE.lang === "zh" ? "正在重新连接…" : STATE.lang === "ja" ? "再接続中…" : "Reconnecting…"); return; }
  send({ t: "action", action });
};

/** Friend: show the host's latest state, keeping this phone's own selection where it still applies. */
function applyGuestState(s) {
  const o = STATE.online, prev = STATE.pk;
  if (!s) { if (prev && isOnline(prev)) STATE.pk = null; app.render(); return; }
  const pk = deserializeMatch(s, resolveCharacter, 2);
  if (prev && isOnline(prev) && prev.matchId === pk.matchId && prev.turn === pk.turn) pk.selectedIndex = prev.selectedIndex;
  // History on the friend's phone: save the match once, then add the verdict when it arrives
  const saved = o.saved[pk.matchId];
  if (pk.ended && !saved) o.saved[pk.matchId] = pk.historyId = saveBattle(pk);
  else if (saved) pk.historyId = saved;
  if (pk.historyId && pk.referee?.verdict && !o.verdictSaved?.[pk.matchId]) {
    attachVerdict(pk.historyId, { verdict: pk.referee.verdict, lang: pk.referee.lang, model: pk.referee.model, at: pk.referee.at });
    (o.verdictSaved ||= {})[pk.matchId] = true;
  }
  STATE.pk = pk;
  if (STATE.screen === "room" || (STATE.screen !== "pk" && (!prev || prev.matchId !== pk.matchId))) app.go("pk");
  else app.render();
}
