/* Anime Fusion rooms: play a PK match with a friend on two phones.
 *
 * A room is one Durable Object (one small, strongly consistent "mailbox" per room code).
 * It does not run the game. The host's phone runs the rules exactly as in local play and
 * sends the match state after every move; the room keeps the latest copy and relays it to
 * the friend. The friend's taps are sent to the host as actions. So this file stays small
 * and the game logic lives in one place (the app).
 *
 *   POST /rooms                      → { code, hostToken }        create a room
 *   GET  /rooms/:code                → { exists, host, guest }    is it there, who's online
 *   GET  /rooms/:code/ws?role=host&token=…    WebSocket (host)
 *   GET  /rooms/:code/ws?role=guest[&token=…] WebSocket (friend; token after first join)
 *   GET  /                           → health check
 *
 * Messages are JSON. Host → room: {t:"state", seq, full, public}. Friend → room:
 * {t:"action", action}. Room → host: welcome, presence, action. Room → friend: welcome,
 * presence, state. "full" is the host's own copy (kept so the host can recover after a
 * reload); only "public" is ever sent to the friend, so hidden information such as the
 * auction deck order never reaches the friend's phone.
 *
 * Settings (wrangler.json "vars"):
 *   ALLOWED_ORIGINS  comma-separated pages allowed to use the rooms
 *   ROOM_TTL_HOURS   rooms are deleted this long after the last activity (default 48)
 */
import { VERSION, json, randomCode, validCode, RoomCore } from "./core.js";

function allowedOrigin(req, env) {
  const origin = req.headers.get("Origin");
  if (!origin) return null; // not a browser page (curl, tests): no CORS headers needed
  const list = String(env.ALLOWED_ORIGINS || "https://nootnoot0328.github.io").split(",").map(s => s.trim()).filter(Boolean);
  return list.includes(origin) ? origin : false;
}
const cors = origin => (origin ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "content-type", Vary: "Origin" } : {});

export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = allowedOrigin(req, env);
    if (origin === false) return json({ error: "origin not allowed" }, 403);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (url.pathname === "/") return json({ ok: true, service: "anime-fusion-rooms", version: VERSION }, 200, cors(origin));

    if (url.pathname === "/rooms" && req.method === "POST") {
      // a few tries in the (tiny) chance a code is already taken
      for (let i = 0; i < 5; i++) {
        const code = randomCode(), stub = env.ROOMS.get(env.ROOMS.idFromName(code));
        const r = await stub.fetch("https://room/init", { method: "POST", body: JSON.stringify({ code }) });
        if (r.status === 200) return json(await r.json(), 200, cors(origin));
      }
      return json({ error: "could not create a room, try again" }, 503, cors(origin));
    }
    const m = url.pathname.match(/^\/rooms\/([A-Z0-9]+)(\/ws)?$/);
    if (m) {
      if (!validCode(m[1])) return json({ error: "bad room code" }, 400, cors(origin));
      const stub = env.ROOMS.get(env.ROOMS.idFromName(m[1]));
      if (m[2]) {
        if (req.headers.get("Upgrade") !== "websocket") return json({ error: "expected a WebSocket" }, 426, cors(origin));
        return stub.fetch(new Request("https://room/ws" + url.search, req));
      }
      const r = await stub.fetch("https://room/info");
      return json(await r.json(), r.status, cors(origin));
    }
    return json({ error: "not found" }, 404, cors(origin));
  },
};

/** The Durable Object: WebSocket hibernation keeps idle rooms free (no duration billing). */
export class Room {
  constructor(ctx, env) {
    this.ctx = ctx; this.env = env;
    const sockets = {
      all: () => ctx.getWebSockets(),
      list: tag => ctx.getWebSockets(tag).filter(ws => ws.readyState === 1),
    };
    this.core = new RoomCore(ctx.storage, sockets);
    this.ttl = Number(env.ROOM_TTL_HOURS) || 48;
  }
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/init") { const { code } = await req.json(); const r = await this.core.init(code); if (r.status === 200) await this.ctx.storage.setAlarm(Date.now() + this.ttl * 3600_000); return json(r.body, r.status); }
    if (url.pathname === "/info") { const r = await this.core.info(); return json(r.body, r.status); }
    if (url.pathname === "/ws") {
      const a = await this.core.admit(url.searchParams.get("role"), url.searchParams.get("token"));
      if (!a.ok) return json({ error: a.error }, a.status);
      const pair = new WebSocketPair(), [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server, [a.role]);
      server.serializeAttachment({ role: a.role });
      await this.core.welcome(server, a.role, a.guestToken);
      return new Response(null, { status: 101, webSocket: client });
    }
    return json({ error: "not found" }, 404);
  }
  async webSocketMessage(ws, raw) { await this.core.message(ws, ws.deserializeAttachment()?.role, raw); await this.ctx.storage.setAlarm(Date.now() + this.ttl * 3600_000); }
  async webSocketClose(ws) { try { ws.close(); } catch { } this.core.closed(); }
  async webSocketError() { this.core.closed(); }
  async alarm() { if (!(await this.core.expire(this.ttl))) await this.ctx.storage.setAlarm(Date.now() + this.ttl * 3600_000); }
}
