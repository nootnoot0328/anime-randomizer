// Auction PK: rules engine and the computer bidder.
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
const C = await import("../src/game/cpu.js");
const A = await import("../src/game/auction.js");
R.setRoster(read("data/roster.json"));
STATE.formPortraits = read("data/form-portraits.json");

function seeded(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pool = R.pkCharacters(R.getSeries("onepiece").chars), roles = R.budgetRoleSet("onepiece");
function match(deck) {
  const pk = { kind: "auction", ...A.newAuctionSides("onepiece", roles), deck: deck || A.buildDeck(pool, 10, seeded(1)), seen: new Set(), used: new Set(), auctionLog: [], turn: 1, ended: false };
  A.openLot(pk); return pk;
}

test("deck: 15 cards, one form per character, hidden order", () => {
  const d = A.buildDeck(pool, 10, seeded(4));
  assert.equal(d.length, 15);
  assert.equal(new Set(d.map(c => c.id)).size, 15);
  assert.notDeepEqual(d.map(c => c.id), A.buildDeck(pool, 10, seeded(5)).map(c => c.id));
});

test("open bidding: must beat the current bid, can't exceed your money, passing hands the card to the leader", () => {
  const pk = match();
  assert.equal(pk.lot.toAct, 1); // player 1 opens the first card
  assert.equal(A.placeBid(pk, 2, 5).reason, "not-your-turn");
  assert.equal(A.placeBid(pk, 1, 0).reason, "too-low");
  assert.equal(A.placeBid(pk, 1, 101).reason, "no-money");
  assert.equal(A.placeBid(pk, 1, 10).ok, true);
  assert.equal(A.placeBid(pk, 2, 10).reason, "too-low"); // no ties
  assert.equal(A.placeBid(pk, 2, 12).ok, true);
  const c = pk.lot.c;
  assert.deepEqual(A.pass(pk, 1), { ok: true, result: "won" });
  assert.deepEqual(pk.lot.won, { player: 2, price: 12 });
  assert.equal(pk.turn, 2); // the winner places the card
  assert.equal(A.awardRole(pk, roles[0]).ok, true);
  assert.equal(pk.p2.budget, 88); assert.equal(pk.p2.team[0].character.id, c.id);
  assert.equal(pk.lot.toAct, 2); // the opener alternates: player 2 opens card 2
});

test("both passing with no bid: the card goes unsold and is gone", () => {
  const pk = match(), c = pk.lot.c;
  A.pass(pk, 1); assert.equal(pk.lot.toAct, 2);
  assert.deepEqual(A.pass(pk, 2), { ok: true, result: "unsold" });
  assert.equal(pk.auctionLog[0].id, c.id); assert.equal(pk.auctionLog[0].player, null);
  assert.notEqual(pk.lot.c.id, c.id);
});

test("bidding the other player's whole budget wins at once", () => {
  const pk = match(); pk.p2.budget = 20;
  assert.deepEqual(A.placeBid(pk, 1, 20), { ok: true, won: true });
  assert.equal(pk.lot.won.player, 1);
});

test("a full or broke player is out; the other gets each card at $1, take it or pass", () => {
  const pk = match();
  pk.p2.budget = 0; // broke
  A.openLot(pk); // re-deal under the new state
  assert.equal(pk.lot.solo, 1);
  assert.deepEqual(A.placeBid(pk, 1, 50), { ok: true, won: true });
  assert.equal(pk.lot.won.price, 1);
  A.awardRole(pk, roles[0]); assert.equal(pk.p1.budget, 99);
  assert.equal(A.pass(pk, 1).result, "unsold"); // solo pass = unsold
});

test("the auction ends when both are out or the cards run out; empty roles stay empty", () => {
  const pk = match(A.buildDeck(pool, 10, seeded(2)).slice(0, 3));
  for (let i = 0; i < 3; i++) { A.pass(pk, pk.lot.toAct); if (pk.lot) A.pass(pk, pk.lot.toAct); }
  assert.equal(pk.ended, true); assert.equal(pk.lot, null);
  assert.equal(pk.p1.team.length + pk.p2.team.length, 0);
});

/* ---------------------------------------------------------------- computer */
const ch = id => R.getCharacter(id);
const side = (budget = 100, team = []) => ({ seriesId: "onepiece", roles: [...roles], team, budget });

test("computer pays more for a better fit, keeps $1 for each other open role, and never bids above its limit", () => {
  const unseen = pool.filter(c => !["onepiece-shanks", "onepiece-carrot"].includes(c.id));
  const star = C.auctionValue({ c: ch("onepiece-shanks"), me: side(), opp: side(), unseen, remaining: 12 });
  const weak = C.auctionValue({ c: ch("onepiece-carrot"), me: side(), opp: side(), unseen, remaining: 12 });
  assert.ok(star > weak, `star ${star} > weak ${weak}`);
  assert.ok(star <= 96, "keeps $4 for the other 4 roles");
  const lot = { c: ch("onepiece-shanks"), bid: star, leader: 1, solo: null };
  assert.deepEqual(C.decideAuction({ lot, me: side(), opp: side(), unseen, remaining: 12 }), { action: "pass" });
  const open = C.decideAuction({ lot: { ...lot, bid: 0, leader: null }, me: side(), opp: side(), unseen, remaining: 12 });
  assert.equal(open.action, "bid"); assert.ok(open.amount < star, "opens below its limit");
});

test("computer spends everything on its last role, and takes $1 leftovers it needs", () => {
  const filled = roles.slice(0, 4).map(r => ({ role: r, character: ch("onepiece-nami"), price: 1 }));
  const v = C.auctionValue({ c: ch("onepiece-kaido"), me: side(30, filled), opp: side(), unseen: pool, remaining: 3 });
  assert.ok(v > 10 && v <= 30);
  const solo = C.decideAuction({ lot: { c: ch("onepiece-usopp"), bid: 0, solo: 2 }, me: side(30, filled), opp: side(0), unseen: pool, remaining: 0 });
  assert.deepEqual(solo, { action: "bid", amount: 1 });
});

test("simulated auctions: strategic beats casual and a never-bid player, and teams fill", () => {
  const rng = seeded(11);
  const bot = diff => ({ diff });
  const passive = { passive: true };
  function play(seriesId, b1, b2) {
    const pl = R.pkCharacters(R.getSeries(seriesId).chars), rs = R.budgetRoleSet(seriesId);
    const pk = { kind: "auction", ...A.newAuctionSides(seriesId, rs), deck: A.buildDeck(pl, rs.length * 2, rng), seen: new Set(), used: new Set(), auctionLog: [], turn: 1, ended: false };
    const bots = { 1: b1, 2: b2 }; A.openLot(pk);
    for (let guard = 0; !pk.ended && guard < 500; guard++) {
      const lot = pk.lot, unseen = A.unseenPool(pk, pl), remaining = pk.deck.length;
      if (lot.won) { const n = lot.won.player; A.awardRole(pk, C.auctionRoleFor(lot.c, A.openRolesOf(pk[`p${n}`]), unseen, remaining).role); continue; }
      const n = lot.toAct, b = bots[n], me = pk[`p${n}`], opp = pk[`p${n === 1 ? 2 : 1}`];
      if (b.passive) { lot.solo ? A.placeBid(pk, n, 1) : A.pass(pk, n); continue; }
      lot.cache = lot.cache || {};
      if (lot.cache[n] === undefined) lot.cache[n] = C.auctionValue({ c: lot.c, me, opp, unseen, remaining, difficulty: b.diff, rng });
      const d = C.decideAuction({ lot, me, opp, unseen, remaining, difficulty: b.diff, rng, wtp: lot.cache[n] });
      const r = d.action === "bid" ? A.placeBid(pk, n, d.amount) : A.pass(pk, n);
      if (!r.ok) A.pass(pk, n);
    }
    assert.equal(pk.ended, true, "auction terminates");
    return pk;
  }
  const rate = (a, b) => {
    let wins = 0, games = 0, empty = 0;
    for (const s of R.allSeries().map(x => x.id)) for (let g = 0; g < 4; g++) {
      const swap = g % 2, pk = play(s, swap ? b : a, swap ? a : b);
      const mine = swap ? pk.p2 : pk.p1, theirs = swap ? pk.p1 : pk.p2;
      if (C.teamValue(mine.team) > C.teamValue(theirs.team)) wins++;
      empty += mine.roles.length - mine.team.length; games++;
    }
    return { win: wins / games, empty: empty / games };
  };
  const vsCasual = rate(bot("strategic"), bot("casual")), vsPassive = rate(bot("strategic"), passive);
  assert.ok(vsCasual.win > 0.55, `strategic vs casual ${vsCasual.win}`);
  assert.ok(vsPassive.win > 0.7, `strategic vs never-bid ${vsPassive.win}`);
  assert.ok(vsCasual.empty < 0.2, `strategic leaves roles empty ${vsCasual.empty}`);
});

test("auction matches are judged like Budget PK: five roles, no traitor rules", async () => {
  const { buildPKJudgePrompt } = await import("../src/core/prompts.js");
  const { refereeFormat } = await import("../src/ai/format.js");
  const pk = match(); pk.p1.team.push({ role: roles[0], character: R.getCharacter("onepiece-shanks"), price: 30 });
  const text = buildPKJudgePrompt(pk, "en"), json = refereeFormat(pk, "en");
  assert.doesNotMatch(text, /BETRAYAL|Traitor \/ Rogue/);
  assert.doesNotMatch(json, /betrayal/);
  assert.match(text, /Shanks/);
});
