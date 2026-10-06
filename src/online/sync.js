// Turns a live match into plain JSON for the room and back. Pure (no DOM, no sockets) so it
// can be unit-tested.
//
// Two copies: "full" for the host's own recovery after a reload, and "public" for the friend.
// The public copy leaves out anything the friend's phone must not know: the auction's hidden
// deck order and which characters the host has already seen coming.

const ref = c => (c ? { id: c.id, k: c.phaseKey || null } : null);
const side = p => ({
  seriesId: p.seriesId, roles: [...p.roles], budget: p.budget ?? null, sellUsed: Boolean(p.sellUsed), finished: Boolean(p.finished),
  team: p.team.map(x => ({ role: x.role, c: ref(x.character), price: x.price || 0 })),
});
const refereeOut = r => (r ? { status: r.status, verdict: r.verdict || null, lang: r.lang || null, model: r.model || null, at: r.at || null, code: r.code || null, detail: r.detail || null } : null);

/** @param {"full"|"public"} audience */
export function serializeMatch(pk, audience = "public") {
  if (!pk) return null;
  const out = {
    v: 1, kind: pk.kind, turn: pk.turn, ended: Boolean(pk.ended), battlefieldSeriesId: pk.battlefieldSeriesId || null, shared: Boolean(pk.shared),
    p1: side(pk.p1), p2: side(pk.p2), used: [...(pk.used || [])], justFilled: pk.justFilled || null, referee: refereeOut(pk.referee), matchId: pk.matchId || null,
  };
  if (pk.kind === "random") Object.assign(out, { pair: pk.revealing ? [] : (pk.pair || []).map(ref), revealing: Boolean(pk.revealing), skips: { ...(pk.skips || {}) } });
  if (pk.kind === "auction") {
    const lot = pk.lot;
    Object.assign(out, {
      lot: lot ? { c: ref(lot.c), bid: lot.bid, leader: lot.leader, toAct: lot.toAct, passed: [...lot.passed], solo: lot.solo, won: lot.won } : null,
      deckLeft: pk.deck?.length || 0, deckSize: pk.deckSize || 0, lotNumber: pk.lotNumber || 0, auctionLog: (pk.auctionLog || []).slice(0, 15),
      lastAction: pk.lastAction ? { ...pk.lastAction, c: ref(pk.lastAction.c) } : null,
    });
    if (audience === "full") Object.assign(out, { deck: (pk.deck || []).map(ref), seen: [...(pk.seen || [])], auctionLogAll: pk.auctionLog || [] });
  }
  if (audience === "full") out.difficulty = pk.difficulty || null;
  return out;
}

/**
 * Rebuild a match the screens can render. `resolve(id, phaseKey)` looks a character up.
 * `me` is which player this phone controls (host 1, friend 2).
 */
export function deserializeMatch(s, resolve, me) {
  if (!s) return null;
  const char = r => (r ? resolve(r.id, r.k) : null);
  const sideIn = p => ({ ...p, roles: [...p.roles], team: p.team.map(x => ({ role: x.role, character: char(x.c), price: x.price })).filter(x => x.character) });
  const pk = {
    kind: s.kind, opponent: "online", me, difficulty: s.difficulty || "strategic", turn: s.turn, ended: s.ended, battlefieldSeriesId: s.battlefieldSeriesId, shared: s.shared,
    p1: sideIn(s.p1), p2: sideIn(s.p2), used: new Set(s.used || []), justFilled: s.justFilled, referee: s.referee, matchId: s.matchId || null,
    cpuTimer: null, cpuThinking: false, selectedIndex: null, historyId: null,
  };
  if (s.kind === "random") Object.assign(pk, { pair: (s.pair || []).map(char).filter(Boolean), revealing: s.revealing, revealTimer: null, skips: { ...s.skips } });
  if (s.kind === "auction") {
    Object.assign(pk, {
      lot: s.lot ? { ...s.lot, c: char(s.lot.c), passed: [...(s.lot.passed || [])] } : null,
      // the friend only knows how many cards are left, never which
      deck: s.deck ? s.deck.map(char) : Array(s.deckLeft || 0).fill(null),
      deckSize: s.deckSize, lotNumber: s.lotNumber, auctionLog: s.auctionLogAll || s.auctionLog || [], seen: new Set(s.seen || []),
      lastAction: s.lastAction ? { ...s.lastAction, c: char(s.lastAction.c) } : null,
    });
  }
  return pk;
}

/** Stable key for a character card (character + form), used in friend → host actions. */
export const cardKey = c => (c ? `${c.id}::${c.phaseKey || ""}` : "");
