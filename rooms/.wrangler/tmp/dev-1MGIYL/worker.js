var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// core.js
var VERSION = "1.0.0";
var CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
var CODE_LENGTH = 5;
var MAX_MESSAGE = 256 * 1024;
var json = /* @__PURE__ */ __name((data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...headers } }), "json");
var randomCode = /* @__PURE__ */ __name(() => Array.from(crypto.getRandomValues(new Uint8Array(CODE_LENGTH)), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join(""), "randomCode");
var randomToken = /* @__PURE__ */ __name(() => Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, "0")).join(""), "randomToken");
var validCode = /* @__PURE__ */ __name((code) => typeof code === "string" && code.length === CODE_LENGTH && [...code].every((ch) => CODE_ALPHABET.includes(ch)), "validCode");
var RoomCore = class {
  static {
    __name(this, "RoomCore");
  }
  constructor(storage, sockets, now = () => Date.now()) {
    this.storage = storage;
    this.sockets = sockets;
    this.now = now;
  }
  async meta() {
    return await this.storage.get("meta") || null;
  }
  async init(code) {
    if (await this.meta()) return { status: 409, body: { error: "taken" } };
    const meta = { code, hostToken: randomToken(), guestToken: null, created: this.now(), last: this.now() };
    await this.storage.put("meta", meta);
    return { status: 200, body: { code, hostToken: meta.hostToken } };
  }
  presence() {
    return { host: this.sockets.list("host").length > 0, guest: this.sockets.list("guest").length > 0 };
  }
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
    if (this.sockets.list("guest").length) return { ok: false, status: 409, error: "room full" };
    meta.guestToken = randomToken();
    meta.last = this.now();
    await this.storage.put("meta", meta);
    return { ok: true, role, guestToken: meta.guestToken };
  }
  async welcome(ws, role, guestToken) {
    const [seq, full, pub] = await Promise.all([this.storage.get("seq"), this.storage.get("full"), this.storage.get("public")]);
    this.send(ws, { t: "welcome", role, guestToken: role === "guest" ? guestToken : void 0, seq: seq || 0, state: (role === "host" ? full : pub) ?? null, presence: this.presence() });
    this.broadcastPresence();
  }
  async message(ws, role, raw) {
    if (typeof raw !== "string" || raw.length > MAX_MESSAGE) return this.send(ws, { t: "error", code: "too-large" });
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return this.send(ws, { t: "error", code: "bad-json" });
    }
    if (msg.t === "ping") return this.send(ws, { t: "pong" });
    const meta = await this.meta();
    if (!meta) return this.send(ws, { t: "error", code: "gone" });
    meta.last = this.now();
    await this.storage.put("meta", meta);
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
    if (msg.t === "leave") {
      this.send(ws, { t: "bye" });
      try {
        ws.close(1e3, "left");
      } catch {
      }
      return;
    }
    this.send(ws, { t: "error", code: "unknown-message" });
  }
  closed() {
    this.broadcastPresence();
  }
  broadcastPresence() {
    const p = { t: "presence", ...this.presence() };
    for (const ws of this.sockets.all()) this.send(ws, p);
  }
  send(ws, data) {
    try {
      ws.send(JSON.stringify(data));
    } catch {
    }
  }
  async expire(ttlHours) {
    const meta = await this.meta();
    if (!meta) return true;
    if (this.now() - meta.last >= ttlHours * 36e5 && !this.sockets.all().length) {
      await this.storage.deleteAll();
      return true;
    }
    return false;
  }
};

// worker.js
function allowedOrigin(req, env) {
  const origin = req.headers.get("Origin");
  if (!origin) return null;
  const list = String(env.ALLOWED_ORIGINS || "https://nootnoot0328.github.io").split(",").map((s) => s.trim()).filter(Boolean);
  return list.includes(origin) ? origin : false;
}
__name(allowedOrigin, "allowedOrigin");
var cors = /* @__PURE__ */ __name((origin) => origin ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "content-type", Vary: "Origin" } : {}, "cors");
var worker_default = {
  async fetch(req, env) {
    const url = new URL(req.url), origin = allowedOrigin(req, env);
    if (origin === false) return json({ error: "origin not allowed" }, 403);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (url.pathname === "/") return json({ ok: true, service: "anime-fusion-rooms", version: VERSION }, 200, cors(origin));
    if (url.pathname === "/rooms" && req.method === "POST") {
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
  }
};
var Room = class {
  static {
    __name(this, "Room");
  }
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    const sockets = {
      all: /* @__PURE__ */ __name(() => ctx.getWebSockets(), "all"),
      list: /* @__PURE__ */ __name((tag) => ctx.getWebSockets(tag).filter((ws) => ws.readyState === 1), "list")
    };
    this.core = new RoomCore(ctx.storage, sockets);
    this.ttl = Number(env.ROOM_TTL_HOURS) || 48;
  }
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/init") {
      const { code } = await req.json();
      const r = await this.core.init(code);
      if (r.status === 200) await this.ctx.storage.setAlarm(Date.now() + this.ttl * 36e5);
      return json(r.body, r.status);
    }
    if (url.pathname === "/info") {
      const r = await this.core.info();
      return json(r.body, r.status);
    }
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
  async webSocketMessage(ws, raw) {
    await this.core.message(ws, ws.deserializeAttachment()?.role, raw);
    await this.ctx.storage.setAlarm(Date.now() + this.ttl * 36e5);
  }
  async webSocketClose(ws) {
    try {
      ws.close();
    } catch {
    }
    this.core.closed();
  }
  async webSocketError() {
    this.core.closed();
  }
  async alarm() {
    if (!await this.core.expire(this.ttl)) await this.ctx.storage.setAlarm(Date.now() + this.ttl * 36e5);
  }
};

// ../../../../tmp/claude-0/-home-claude/68cf3ece-3186-57a5-83b1-0f3a71c732a1/scratchpad/wr/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../tmp/claude-0/-home-claude/68cf3ece-3186-57a5-83b1-0f3a71c732a1/scratchpad/wr/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-oUveDS/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../../tmp/claude-0/-home-claude/68cf3ece-3186-57a5-83b1-0f3a71c732a1/scratchpad/wr/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-oUveDS/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  Room,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
