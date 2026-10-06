// Rooms server logic that doesn't need the Workers runtime, so Node tests can import it.
// worker.js is the deployed entry point; the Workers runtime only accepts handlers and
// Durable Object classes as exports there, so plain values live here.
export const VERSION = "1.0.0";
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L
const CODE_LENGTH = 5;
const MAX_MESSAGE = 256 * 1024;

export const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...headers } });
export const randomCode = () => Array.from(crypto.getRandomValues(new Uint8Array(CODE_LENGTH)), b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
const randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, "0")).join("");
export const validCode = code => typeof code === "string" && code.length === CODE_LENGTH && [...code].every(ch => CODE_ALPHABET.includes(ch));


/** Room logic, kept separate from the Durable Object plumbing so it can be unit-tested. */
export class RoomCore {
  constructor(storage, sockets, now = () => Date.now()) { this.storage = storage; this.sockets = sockets; this.now = now; }
  async meta() { return (await this.storage.get("meta")) || null; }
  async init(code) {
    if (await this.meta()) return { status: 409, body: { error: "taken" } };
    const meta = { code, hostToken: randomToken(), guestToken: null, created: this.now(), last: this.now() };
    await this.storage.put("meta", meta);
    return { status: 200, body: { code, hostToken: meta.hostToken } };
  }
  presence() { return { host: this.sockets.list("host").length > 0, guest: this.sockets.list("guest").length > 0 }; }
  async info() {
    const meta = await this.meta();
    return meta ? { status: 200, body: { exists: true, ...this.presence() } } : { status: 404, body: { exists: false } };
  }
  /** Decide whether a socket may join. Returns {ok, role, guestToken} or {ok:false, status, error}. */
  async admit(role, token) {
    const meta = await this.meta();
    if (!meta) return { ok: false, status: 404, error: "no such room" };
    if (role === "host") return token && token === meta.hostToken ? { ok: true, role } : { ok: false, status: 403, error: "not the host" };
    if (role !== "guest") return { ok: false, status: 400, error: "bad role" };
    if (meta.guestToken && token === meta.guestToken) return { ok: true, role, guestToken: meta.guestToken };
    // a new friend may take the seat only while nobody is in it
    if (this.sockets.list("guest").length) return { ok: false, status: 409, error: "room full" };
    meta.guestToken = randomToken(); meta.last = this.now();
    await this.storage.put("meta", meta);
    return { ok: true, role, guestToken: meta.guestToken };
  }
  async welcome(ws, role, guestToken) {
    const [seq, full, pub] = await Promise.all([this.storage.get("seq"), this.storage.get("full"), this.storage.get("public")]);
    this.send(ws, { t: "welcome", role, guestToken: role === "guest" ? guestToken : undefined, seq: seq || 0, state: (role === "host" ? full : pub) ?? null, presence: this.presence() });
    this.broadcastPresence();
  }
  async message(ws, role, raw) {
    if (typeof raw !== "string" || raw.length > MAX_MESSAGE) return this.send(ws, { t: "error", code: "too-large" });
    let msg; try { msg = JSON.parse(raw); } catch { return this.send(ws, { t: "error", code: "bad-json" }); }
    if (msg.t === "ping") return this.send(ws, { t: "pong" });
    const meta = await this.meta(); if (!meta) return this.send(ws, { t: "error", code: "gone" });
    meta.last = this.now(); await this.storage.put("meta", meta);
    if (role === "host" && msg.t === "state") {
      const seq = Number(msg.seq) || 0;
      await this.storage.put({ seq, full: msg.full ?? null, public: msg.public ?? null });
      for (const g of this.sockets.list("guest")) this.send(g, { t: "state", seq, state: msg.public ?? null });
      return;
    }
    if (role === "guest" && msg.t === "action") {
      const hosts = this.sockets.list("host");
      if (!hosts.length) return this.send(ws, { t: "error", code: "host-away" });
      for (const h of hosts) this.send(h, { t: "action", action: msg.action });
      return;
    }
    if (msg.t === "leave") { this.send(ws, { t: "bye" }); try { ws.close(1000, "left"); } catch { } return; }
    this.send(ws, { t: "error", code: "unknown-message" });
  }
  closed() { this.broadcastPresence(); }
  broadcastPresence() { const p = { t: "presence", ...this.presence() }; for (const ws of this.sockets.all()) this.send(ws, p); }
  send(ws, data) { try { ws.send(JSON.stringify(data)); } catch { } }
  async expire(ttlHours) {
    const meta = await this.meta(); if (!meta) return true;
    if (this.now() - meta.last >= ttlHours * 3600_000 && !this.sockets.all().length) { await this.storage.deleteAll(); return true; }
    return false;
  }
}

