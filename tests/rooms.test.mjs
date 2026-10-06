// Rooms server: who may join, what each side receives, and that hidden state never reaches the friend.
import test from "node:test";
import assert from "node:assert/strict";
import { RoomCore, validCode } from "../rooms/core.js";
import worker from "../rooms/worker.js";

function memoryStorage() {
  const m = new Map();
  return {
    async get(k) { return m.get(k); },
    async put(k, v) { if (typeof k === "object") for (const [a, b] of Object.entries(k)) m.set(a, b); else m.set(k, v); },
    async deleteAll() { m.clear(); }, map: m,
  };
}
function fakeSockets() {
  const socks = [];
  return {
    add(role) { const ws = { role, readyState: 1, sent: [], send(s) { this.sent.push(JSON.parse(s)); }, close() { this.readyState = 3; } }; socks.push(ws); return ws; },
    all: () => socks.filter(s => s.readyState === 1),
    list: tag => socks.filter(s => s.role === tag && s.readyState === 1),
  };
}
async function room() {
  const storage = memoryStorage(), sockets = fakeSockets(); let t = 1000;
  const core = new RoomCore(storage, sockets, () => t);
  const created = await core.init("ABCDE");
  return { core, storage, sockets, hostToken: created.body.hostToken, tick: ms => { t += ms; } };
}
const last = (ws, type) => [...ws.sent].reverse().find(m => m.t === type);

test("room codes: 5 characters without look-alikes", () => {
  assert.ok(validCode("ABCDE")); assert.ok(validCode("K7Q2M"));
  for (const bad of ["ABCD", "ABCDEF", "ABCD0", "abcde", "ABCDI", 5]) assert.ok(!validCode(bad), String(bad));
});

test("a code can't be created twice; only the host token opens the host seat", async () => {
  const { core, hostToken } = await room();
  assert.equal((await core.init("ABCDE")).status, 409);
  assert.equal((await core.admit("host", "nope")).status, 403);
  assert.equal((await core.admit("host")).status, 403);
  assert.deepEqual(await core.admit("host", hostToken), { ok: true, role: "host" });
  assert.equal((await core.admit("spectator")).status, 400);
});

test("the friend gets a token to come back; a second phone can't take the seat while they're in it", async () => {
  const { core, sockets } = await room();
  const first = await core.admit("guest"); assert.ok(first.ok && first.guestToken);
  sockets.add("guest");
  assert.equal((await core.admit("guest")).status, 409, "room full");
  assert.equal((await core.admit("guest", "wrong")).status, 409);
  assert.ok((await core.admit("guest", first.guestToken)).ok, "rejoin with the token");
  sockets.list("guest")[0].close();
  const takeover = await core.admit("guest"); // seat empty: a new phone may join
  assert.ok(takeover.ok); assert.notEqual(takeover.guestToken, first.guestToken);
});

test("host state is relayed to the friend as the public copy only; the host gets its full copy back", async () => {
  const { core, sockets, hostToken } = await room();
  await core.admit("host", hostToken); const host = sockets.add("host"); await core.welcome(host, "host");
  const g = await core.admit("guest"); const guest = sockets.add("guest"); await core.welcome(guest, "guest", g.guestToken);
  assert.deepEqual(last(host, "presence"), { t: "presence", host: true, guest: true });
  assert.equal(last(guest, "welcome").guestToken, g.guestToken);
  assert.equal(last(host, "welcome").guestToken, undefined, "the host never sees the friend's token");
  await core.message(host, "host", JSON.stringify({ t: "state", seq: 3, full: { deck: ["secret"] }, public: { deckLeft: 1 } }));
  assert.deepEqual(last(guest, "state"), { t: "state", seq: 3, state: { deckLeft: 1 } });
  assert.ok(!JSON.stringify(guest.sent).includes("secret"), "hidden deck never reaches the friend");
  // reconnects: each side gets its own copy
  const host2 = sockets.add("host"); await core.welcome(host2, "host");
  assert.deepEqual(last(host2, "welcome").state, { deck: ["secret"] });
  const guest2 = sockets.add("guest"); await core.welcome(guest2, "guest", g.guestToken);
  assert.deepEqual(last(guest2, "welcome").state, { deckLeft: 1 });
});

test("the friend's taps go to the host as actions; only the host can change the state", async () => {
  const { core, sockets, hostToken } = await room();
  const guest = sockets.add("guest");
  await core.message(guest, "guest", JSON.stringify({ t: "action", action: { type: "bid", amount: 3 } }));
  assert.equal(last(guest, "error").code, "host-away");
  await core.admit("host", hostToken); const host = sockets.add("host");
  await core.message(guest, "guest", JSON.stringify({ t: "action", action: { type: "bid", amount: 3 } }));
  assert.deepEqual(last(host, "action"), { t: "action", action: { type: "bid", amount: 3 } });
  await core.message(guest, "guest", JSON.stringify({ t: "state", seq: 9, full: {}, public: { hacked: true } }));
  assert.equal(last(guest, "error").code, "unknown-message");
  assert.equal(last(host, "state"), undefined);
});

test("bad messages are refused, pings answered, and idle empty rooms expire", async () => {
  const { core, sockets, storage, tick } = await room();
  const ws = sockets.add("host");
  await core.message(ws, "host", "{not json"); assert.equal(last(ws, "error").code, "bad-json");
  await core.message(ws, "host", "x".repeat(300 * 1024)); assert.equal(last(ws, "error").code, "too-large");
  await core.message(ws, "host", JSON.stringify({ t: "ping" })); assert.ok(last(ws, "pong"));
  tick(49 * 3600_000);
  assert.equal(await core.expire(48), false, "someone is still connected");
  ws.close();
  assert.equal(await core.expire(48), true); assert.equal(storage.map.size, 0);
});

test("front door: health check, origin check, code validation", async () => {
  const env = { ALLOWED_ORIGINS: "https://nootnoot0328.github.io" };
  const health = await worker.fetch(new Request("https://rooms.example/"), env);
  assert.equal((await health.json()).service, "anime-fusion-rooms");
  const bad = await worker.fetch(new Request("https://rooms.example/rooms", { method: "POST", headers: { Origin: "https://evil.example" } }), env);
  assert.equal(bad.status, 403);
  const ok = await worker.fetch(new Request("https://rooms.example/", { headers: { Origin: "https://nootnoot0328.github.io" } }), env);
  assert.equal(ok.headers.get("Access-Control-Allow-Origin"), "https://nootnoot0328.github.io");
  assert.equal((await worker.fetch(new Request("https://rooms.example/rooms/abc"), env)).status, 404);
  assert.equal((await worker.fetch(new Request("https://rooms.example/rooms/ABCD0"), env)).status, 400);
});
