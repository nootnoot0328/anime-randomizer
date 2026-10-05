// Auction PK rules. Pure: works on the match object only (no rendering, no timers), so the
// whole flow can be unit-tested and simulated. pk.js wraps these for the screen and the CPU.
//
// Rules
// - Both players start with $100 and the same 5 roles. The deck is 15 cards (10 roles + 5 spares)
//   drawn at random from one series, one form per character, in a hidden order. A small deck
//   makes passing costly: with only 5 spares, a player who waits for bargains ends up with
//   empty roles. (With the whole roster, a player who never bid got stars for $1 at the end.)
// - Open bidding: the opener (alternates each card) bids or passes, then players alternate.
//   Every bid must beat the current one, so there are no ties. Passing while the other player
//   leads hands them the card at their bid. If both pass with no bid, the card goes unsold and
//   is removed from the game.
// - A player is out when their team is full or they have $0. If only one player is still in,
//   each card is offered to them at $1: take it or pass.
// - The auction ends when both players are out or the cards run out. Empty roles stay empty.

export const START_BUDGET = 100;
export const MIN_BID = 1;
export const SPARE_CARDS = 5;

/** One random form per character, shuffled, cut to both teams' roles plus the spares. */
export function buildDeck(pool, slots, rng = Math.random) {
  const byId = new Map();
  for (const c of pool) (byId.get(c.id) || byId.set(c.id, []).get(c.id)).push(c);
  const one = [...byId.values()].map(v => v[Math.floor(rng() * v.length)]);
  for (let i = one.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [one[i], one[j]] = [one[j], one[i]]; }
  return one.slice(0, slots + SPARE_CARDS);
}
/** Cards a player hasn't seen yet (the computer reasons about these, never about the hidden order). */
export function unseenPool(pk, pool) { return pool.filter(c => !pk.seen.has(c.id)); }

export function newAuctionSides(seriesId, roles) {
  const side = () => ({ seriesId, roles: [...roles], team: [], budget: START_BUDGET });
  return { p1: side(), p2: side() };
}

const other = n => (n === 1 ? 2 : 1);
export function openRolesOf(p) { return p.roles.filter(r => !p.team.some(x => x.role === r)); }
/** Still bidding: has an open role and at least the minimum bid. */
export function canBid(p) { return openRolesOf(p).length > 0 && p.budget >= MIN_BID; }
export function activeBidders(pk) { return [1, 2].filter(n => canBid(pk[`p${n}`])); }

/** Put the next card up, or end the auction. Returns the new lot or null when it's over. */
export function openLot(pk) {
  pk.lot = null;
  const active = activeBidders(pk);
  if (!active.length || !pk.deck.length) { pk.ended = true; pk.turn = 1; return null; }
  pk.lotNumber = (pk.lotNumber || 0) + 1;
  const c = pk.deck.shift();
  pk.seen.add(c.id);
  const opener = pk.lotNumber % 2 === 1 ? 1 : 2;
  const solo = active.length === 1 ? active[0] : null;
  const first = solo || opener;
  pk.lot = { c, bid: 0, leader: null, toAct: first, passed: [], solo, won: null };
  pk.turn = first;
  return pk.lot;
}

/** Highest bid this player may make on the current lot. */
export function maxBidFor(pk, n) { return pk[`p${n}`].budget; }
/** Lowest legal bid right now. */
export function minNextBid(pk) { return pk.lot?.solo ? MIN_BID : (pk.lot?.bid || 0) + 1; }

/**
 * @returns {{ok:true, won?:boolean} | {ok:false, reason:string}}
 */
export function placeBid(pk, n, amount) {
  const lot = pk.lot;
  if (!lot || lot.won || pk.ended) return { ok: false, reason: "no-lot" };
  if (lot.toAct !== n) return { ok: false, reason: "not-your-turn" };
  amount = Math.floor(Number(amount));
  if (lot.solo) {
    // uncontested: the card goes at the minimum, whatever was pressed
    if (pk[`p${n}`].budget < MIN_BID) return { ok: false, reason: "no-money" };
    lot.bid = MIN_BID; lot.leader = n; lot.won = { player: n, price: MIN_BID }; lot.toAct = null; pk.turn = n;
    return { ok: true, won: true };
  }
  if (!(amount >= minNextBid(pk))) return { ok: false, reason: "too-low" };
  if (amount > maxBidFor(pk, n)) return { ok: false, reason: "no-money" };
  lot.bid = amount; lot.leader = n;
  const o = other(n);
  // the other player can't beat it: the card is won straight away
  if (maxBidFor(pk, o) <= amount || !canBid(pk[`p${o}`])) { lot.won = { player: n, price: amount }; lot.toAct = null; pk.turn = n; return { ok: true, won: true }; }
  lot.toAct = o; pk.turn = o;
  return { ok: true };
}

/** @returns {{ok:true, result:"won"|"unsold"|"next"} | {ok:false, reason:string}} */
export function pass(pk, n) {
  const lot = pk.lot;
  if (!lot || lot.won || pk.ended) return { ok: false, reason: "no-lot" };
  if (lot.toAct !== n) return { ok: false, reason: "not-your-turn" };
  if (!lot.passed.includes(n)) lot.passed.push(n);
  if (lot.leader && lot.leader !== n) {
    lot.won = { player: lot.leader, price: lot.bid }; lot.toAct = null; pk.turn = lot.leader;
    return { ok: true, result: "won" };
  }
  const o = other(n);
  if (lot.solo || lot.passed.includes(o) || !canBid(pk[`p${o}`])) { unsold(pk); return { ok: true, result: "unsold" }; }
  lot.toAct = o; pk.turn = o;
  return { ok: true, result: "next" };
}

function unsold(pk) {
  const lot = pk.lot;
  pk.auctionLog.unshift({ id: lot.c.id, phaseKey: lot.c.phaseKey || null, player: null, price: 0 });
  openLot(pk);
}

/** The winner puts the card in an open role; then the next card comes up. */
export function awardRole(pk, role) {
  const lot = pk.lot; if (!lot?.won) return { ok: false, reason: "nothing-won" };
  const n = lot.won.player, p = pk[`p${n}`];
  if (!openRolesOf(p).includes(role)) return { ok: false, reason: "role-taken" };
  p.team.push({ role, character: lot.c, price: lot.won.price });
  p.budget -= lot.won.price;
  pk.used.add(lot.c.id);
  pk.auctionLog.unshift({ id: lot.c.id, phaseKey: lot.c.phaseKey || null, player: n, price: lot.won.price, role });
  pk.justFilled = { player: n, role, at: Date.now() };
  openLot(pk);
  return { ok: true, player: n };
}

export function cardsLeft(pk) { return pk.deck.length + (pk.lot && !pk.lot.won ? 1 : 0); }
