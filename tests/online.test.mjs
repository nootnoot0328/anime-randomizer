// Online play: match state survives the trip to the friend's phone, hidden information doesn't,
// and the host only accepts the friend's moves on the friend's turn.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
globalThis.AnimeFusionLogic = require("../logic.js");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const { STATE } = await import("../src/core/state.js");
const R = await import("../src/core/roster.js");
const P = await import("../src/game/pk.js");
const { app } = await import("../src/core/app.js");
const { serializeMatch, deserializeMatch, cardKey } = await import("../src/online/sync.js");
R.setRoster(read("data/roster.json"));
STATE.formPortraits = read("data/form-portraits.json");
STATE.history = [];

const sent = [];
app.sendAction = a => sent.push(a);
function startOnline(kind) {
  STATE.online = null;
  STATE.pkSetup = { kind, p1: "naruto", p2: "onepiece", pool: "onepiece", opponent: "online", difficulty: "strategic" };
  STATE.screen = "pksetup";
  P.startPK(); P.cancelPKTimers();
  return STATE.pk;
}
const guestCopy = pk => deserializeMatch(JSON.parse(JSON.stringify(serializeMatch(pk, "public"))), R.resolveCharacter, 2);

test("auction: the friend's copy has the same board but never the deck order", () => {
  const pk = startOnline("auction");
  assert.equal(pk.opponent, "online"); assert.equal(pk.me, 1);
  const pub = JSON.stringify(serializeMatch(pk, "public")), full = serializeMatch(pk, "full");
  for (const c of pk.deck) assert.ok(!pub.includes(`"${c.id}"`), "upcoming card leaked: " + c.id);
  assert.equal(full.deck.length, pk.deck.length);
  const g = guestCopy(pk);
  assert.equal(g.me, 2); assert.equal(g.lot.c.id, pk.lot.c.id); assert.equal(g.deck.length, pk.deck.length);
  assert.ok(g.deck.every(x => x === null)); assert.equal(g.p1.budget, 20);
});

test("host recovers the whole match from its full copy after a reload", () => {
  const pk = startOnline("auction");
  P.auctionBid(3);
  const back = deserializeMatch(JSON.parse(JSON.stringify(serializeMatch(pk, "full"))), R.resolveCharacter, 1);
  assert.deepEqual(back.deck.map(cardKey), pk.deck.map(cardKey));
  assert.equal(back.lot.bid, 3); assert.equal(back.matchId, pk.matchId);
});

test("turns: the host can't move for the friend, and the friend's moves only count on their turn", () => {
  const pk = startOnline("auction");
  assert.equal(pk.turn, 1); assert.equal(P.isRemoteTurn(), false);
  assert.equal(P.applyRemoteAction({ type: "bid", amount: 5 }), false, "not the friend's turn");
  P.auctionBid(2);
  assert.equal(pk.turn, 2); assert.equal(P.isRemoteTurn(), true); assert.equal(P.isWaiting(), true);
  P.auctionBid(9); // host tapping during the friend's turn
  assert.equal(pk.lot.bid, 2, "ignored");
  assert.equal(P.applyRemoteAction({ type: "bid", amount: 4 }), true);
  assert.equal(pk.lot.bid, 4); assert.equal(pk.lot.leader, 2);
  assert.equal(P.applyRemoteAction({ type: "hack" }), false);
  assert.equal(P.applyRemoteAction(null), false);
});

test("budget: the friend's buy arrives by card key and follows the same rules", () => {
  const pk = startOnline("budget");
  const mine = P.budgetPool()[0];
  pk.selectedIndex = 0; P.assignSelectedPKRole(1, pk.p1.roles[0]);
  assert.equal(pk.turn, 2);
  const pick = P.budgetPool().find(c => R.characterPrice(c) <= pk.p2.budget);
  assert.equal(P.applyRemoteAction({ type: "assign", key: cardKey(pick), role: pk.p2.roles[0] }), true);
  assert.equal(pk.p2.team[0].character.id, pick.id);
  assert.equal(P.applyRemoteAction({ type: "assign", key: cardKey(mine), role: pk.p2.roles[1] }), false, "already taken");
  assert.equal(P.applyRemoteAction({ type: "assign", key: "nobody::", role: pk.p2.roles[1] }), false);
});

test("on the friend's phone, moves are sent to the host instead of played", () => {
  const pk = startOnline("auction");
  STATE.pk = guestCopy(pk); STATE.online = { role: "guest" };
  sent.length = 0;
  STATE.pk.turn = 2; STATE.pk.lot.toAct = 2;
  P.auctionBid(6); P.auctionPass();
  assert.deepEqual(sent, [{ type: "bid", amount: 6 }, { type: "pass" }]);
  assert.equal(STATE.pk.lot.bid, 0, "nothing changed locally");
  assert.equal(P.pkPlayerLabel(2), "You"); assert.equal(P.pkPlayerLabel(1), "Friend");
  STATE.online = null;
});

test("random PK: the pair isn't sent while it's still shuffling", () => {
  const pk = startOnline("random");
  pk.revealing = true; pk.pair = [R.getCharacter("naruto-sakura-haruno"), R.getCharacter("naruto-gaara")];
  assert.deepEqual(serializeMatch(pk, "public").pair, []);
  pk.revealing = false;
  assert.equal(serializeMatch(pk, "public").pair.length, 2);
});

test("every finished match is marked ended (the friend's phone and History rely on it)", () => {
  const pk = startOnline("random"); STATE.online = null;
  // fill both teams directly through the normal assign path
  for (let i = 0; i < 12 && !pk.ended; i++) {
    const list = P.pkPool(pk.turn); pk.pair = [list[0], list[1]]; pk.revealing = false;
    pk.selectedIndex = 0; const c = pk.pair[0];
    P.assignPKCharacter(P.openRoles(pk.turn)[0], c); P.cancelPKTimers();
  }
  assert.equal(pk.ended, true);
});

test("budget: a team that can't afford anyone left is finished automatically", () => {
  const pk = startOnline("budget");
  pk.p1.budget = 5;
  const cheap = P.budgetPool().filter(c => R.characterPrice(c) === 5)[0];
  pk.selectedIndex = P.budgetPool().indexOf(cheap);
  P.assignSelectedPKRole(1, pk.p1.roles[0]);
  assert.equal(pk.p1.budget, 0); assert.equal(pk.p1.finished, true, "nothing affordable left");
  assert.equal(pk.p2.finished, false);
});
