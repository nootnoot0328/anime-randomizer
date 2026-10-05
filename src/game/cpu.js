// Computer opponent decision-making. Pure functions: no timers, no DOM, no app state
// beyond the roster lookups, so every choice can be tested.
//
// The computer rates each (character, role) pair with the same priorities the AI referee
// uses: does this character actually perform the role? Raw power counts, but a healer
// slot is worth little without real healing, and a traitor slot should go to whoever
// does the LEAST damage when they betray their own team.
import { parseAttributes, FORMS } from "../data/attributes.js";

const ATTR = parseAttributes();
const DEFAULT = { power: 5, lead: 4, tank: 4, heal: 0, intel: 4 };

/** Ratings for a character, with form overrides applied. */
export function attributes(c) {
  if (!c) return DEFAULT;
  const base = ATTR[c.id] || DEFAULT;
  const form = c.phaseKey ? FORMS[c.id]?.[c.phaseKey] : null;
  return form ? { ...base, ...form } : base;
}
export function hasAttributes(id) { return Boolean(ATTR[id]); }

/** What a role asks for. Series roles are "<series>:<kind>"; the generic fallback set uses names. */
const KIND_BY_KEY = { captain: "lead", leader: "lead", firstmate: "deputy", deputy: "deputy", tanker: "tank", doctor: "heal", healer: "heal", strategist: "intel", traitor: "traitor" };
const KIND_BY_NAME = { Leader: "lead", "Co-Leader": "deputy", Tanker: "tank", Healer: "heal", Strategist: "intel", Traitor: "traitor" };
export function roleKind(role) {
  const key = String(role).split(":")[1];
  return KIND_BY_KEY[key] || KIND_BY_NAME[role] || "deputy";
}

/**
 * How well character c fills role, 0–10.
 *   lead      0.45 power + 0.55 lead
 *   deputy    0.65 power + 0.20 lead + 0.15 tank   (supports, takes over, reinforces)
 *   tank      0.35 power + 0.65 tank
 *   heal      0.15 power + 0.85 heal                (a strong fighter with no healing scores low)
 *   intel     0.30 power + 0.70 intel
 *   traitor   10 − (0.75 power + 0.25 intel)        (the weaker the traitor, the less damage to us)
 */
export function roleScore(c, role) {
  const a = attributes(c);
  switch (roleKind(role)) {
    case "lead": return 0.45 * a.power + 0.55 * a.lead;
    case "tank": return 0.35 * a.power + 0.65 * a.tank;
    case "heal": return 0.15 * a.power + 0.85 * a.heal;
    case "intel": return 0.3 * a.power + 0.7 * a.intel;
    case "traitor": return 10 - (0.75 * a.power + 0.25 * a.intel);
    default: return 0.65 * a.power + 0.2 * a.lead + 0.15 * a.tank;
  }
}
/** The roles a character suits best, best first (for the Gallery card). */
export function bestRoles(c, roles) { return [...roles].filter(r => roleKind(r) !== "traitor").sort((x, y) => roleScore(c, y) - roleScore(c, x)); }
/** Sum of role scores: the computer's estimate of a lineup's strength. */
export function teamValue(team) { return team.reduce((s, x) => s + roleScore(x.character, x.role), 0); }

/** Expected best score for a role from one future random pair (draws with replacement). */
function expectedPairBest(pool, role) {
  if (!pool.length) return 0;
  const s = pool.map(c => roleScore(c, role)).sort((a, b) => a - b), n = s.length;
  let e = 0; for (let i = 0; i < n; i++) e += s[i] * (2 * i + 1) / (n * n);
  return e;
}

function gaussian(rng) { let u = 0, v = 0; while (!u) u = rng(); while (!v) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

/**
 * Random PK: pick one of the pair and a role for them, or skip the pair.
 * Strategic: maximise (score − what that role is likely to get later), so a healer goes
 * to the healer slot even when a stronger fighter is on offer, and the traitor slot
 * waits for someone weak. Skips only when both cards are clearly below expectation.
 * Casual: the same judgement with a lot of noise and the odd careless role.
 * @returns {{action:"pick", index:number, role:string, reason:string} | {action:"skip"}}
 */
export function decideRandom({ pair, openRoles, pool, difficulty = "strategic", canSkip = false, rng = Math.random }) {
  const rest = pool.filter(c => !pair.some(p => p.id === c.id));
  const baseline = Object.fromEntries(openRoles.map(r => [r, expectedPairBest(rest, r)]));
  const casual = difficulty === "casual";
  let best = null;
  pair.forEach((c, index) => openRoles.forEach(role => {
    let gain = roleScore(c, role) - baseline[role];
    if (casual) gain += gaussian(rng) * 2.2;
    if (!best || gain > best.gain) best = { index, role, gain };
  }));
  if (!best) return { action: "skip" };
  if (casual && rng() < 0.25) best.role = openRoles[Math.floor(rng() * openRoles.length)];
  if (!casual && canSkip && openRoles.length > 1 && rest.length > 2 && best.gain < -0.8) return { action: "skip" };
  return { action: "pick", index: best.index, role: best.role, reason: roleKind(best.role) };
}

/**
 * Budget PK planner: the best full lineup for the remaining roles within the budget
 * (beam search; each character used once). Unfillable roles stay empty (worth 0).
 */
export function planBudget(pool, openRoles, budget, price, beam = 160) {
  let states = [{ value: 0, money: budget, picks: [], used: new Set() }];
  // fill the most selective roles first (biggest spread between best and typical fit)
  const order = [...openRoles].sort((a, b) => spread(pool, b) - spread(pool, a));
  for (const role of order) {
    const next = [];
    for (const s of states) {
      next.push({ ...s, picks: [...s.picks] }); // leave empty
      for (const c of pool) {
        const p = price(c);
        if (p > s.money || s.used.has(c.id)) continue;
        const used = new Set(s.used); used.add(c.id);
        next.push({ value: s.value + roleScore(c, role), money: s.money - p, picks: [...s.picks, { character: c, role, price: p }], used });
      }
    }
    next.sort((a, b) => b.value - a.value || b.money - a.money);
    states = next.slice(0, beam);
  }
  return states[0];
}
function spread(pool, role) {
  if (!pool.length) return 0;
  const s = pool.map(c => roleScore(c, role)); return Math.max(...s) - s.reduce((a, b) => a + b, 0) / s.length;
}

/**
 * Budget PK turn.
 * Strategic: plan the whole remaining lineup, then buy the most expensive part of the plan
 * first (stars get taken by the other player). Considers its one sale when selling someone
 * back makes a clearly better lineup affordable.
 * Casual: picks among the better affordable characters at random and slots them where they fit.
 * @returns {{action:"buy", character, role} | {action:"sell", role} | {action:"finish"}}
 */
export function decideBudget({ pool, team, openRoles, budget, sellUsed, difficulty = "strategic", price, rng = Math.random }) {
  const affordable = pool.filter(c => price(c) <= budget);
  if (difficulty === "casual") {
    if (!affordable.length || !openRoles.length) return { action: "finish" };
    const minPrice = Math.min(...pool.map(price));
    const safe = affordable.filter(c => budget - price(c) >= (openRoles.length - 1) * minPrice);
    const scored = (safe.length ? safe : affordable).map(c => ({ c, s: Math.max(...openRoles.map(r => roleScore(c, r))) + gaussian(rng) * 2 }))
      .sort((a, b) => b.s - a.s).slice(0, 6);
    const c = scored[Math.floor(rng() * scored.length)].c;
    const role = rng() < 0.2 ? openRoles[Math.floor(rng() * openRoles.length)] : [...openRoles].sort((a, b) => roleScore(c, b) - roleScore(c, a))[0];
    return { action: "buy", character: c, role };
  }
  const owned = teamValue(team);
  const plan = planBudget(pool, openRoles, budget, price);
  const current = owned + plan.value;
  if (!sellUsed && team.length) {
    let bestSale = null;
    for (const x of team) {
      const alt = owned - roleScore(x.character, x.role) + planBudget([...pool, x.character], [...openRoles, x.role], budget + x.price, price).value;
      if (!bestSale || alt > bestSale.alt) bestSale = { role: x.role, alt };
    }
    if (bestSale && bestSale.alt - current > 1.5) return { action: "sell", role: bestSale.role };
  }
  if (!plan.picks.length) return { action: "finish" };
  const first = [...plan.picks].sort((a, b) => b.price - a.price || roleScore(b.character, b.role) - roleScore(a.character, a.role))[0];
  return { action: "buy", character: first.character, role: first.role };
}

/* ---------------------------------------------------------------- Auction PK */
// The computer never sees the hidden deck order. It knows which characters it hasn't seen yet
// (`unseen`) and how many cards are still to come (`remaining`), and estimates from those.

/**
 * What a role is likely to end up with if we don't buy now: the expected 3rd-best fit among the
 * cards still to come (the other player takes some of the best), or the best when uncontested.
 * Order statistic of a random draw of `remaining` cards from `unseen`, read off the sorted scores.
 */
function expectedLater(unseen, remaining, role, contested = true) {
  if (!unseen.length || remaining <= 0) return 0;
  const s = unseen.map(c => roleScore(c, role)).sort((a, b) => b - a);
  const rank = contested ? 3 : 1;
  return s[Math.min(s.length - 1, Math.floor(s.length * rank / (remaining + 1)))];
}
/** Where the computer puts a card it won. Casual sometimes drops it in a random open role. */
export function auctionPlaceRole(c, openRoles, unseen, remaining, difficulty = "strategic", rng = Math.random) {
  if (difficulty === "casual" && rng() < 0.25) return openRoles[Math.floor(rng() * openRoles.length)];
  return auctionRoleFor(c, openRoles, unseen, remaining).role;
}
/** Best open role for c by gain over what that role would get later. */
export function auctionRoleFor(c, openRoles, unseen, remaining, contested = true) {
  let best = null;
  for (const role of openRoles) {
    const gain = roleScore(c, role) - expectedLater(unseen, remaining, role, contested);
    if (!best || gain > best.gain) best = { role, gain };
  }
  return best;
}

/**
 * The most the computer will pay for this card.
 *   per-slot budget × (1 + 0.4 × gain), where gain = how much better c fills its best open role
 *   than what that role would likely get later. Keeps $1 for each other open role so it can
 *   still pick up leftovers, and pays more when cards are running out.
 * Casual: the same estimate with a lot of noise, and sometimes forgets to keep a reserve.
 */
export function auctionValue({ c, me, opp, unseen, remaining, difficulty = "strategic", rng = Math.random }) {
  const open = me.roles.filter(r => !me.team.some(x => x.role === r));
  if (!open.length || me.budget < 1) return 0;
  const oppOpen = opp.roles.filter(r => !opp.team.some(x => x.role === r)).length;
  const fit = auctionRoleFor(c, open, unseen, remaining);
  const scarce = remaining < open.length + oppOpen;
  let m = 1 + 0.4 * fit.gain;
  if (scarce) m = Math.max(m, 1) * 1.3;
  else if (fit.gain < -1) return 0; // clearly worse than what's likely to come
  m = Math.min(3, Math.max(0, m));
  const casual = difficulty === "casual";
  let wtp = (me.budget / open.length) * m;
  if (casual) wtp *= 0.4 + rng() * 1.2; // at $20 a role is worth ~$4, so casual needs wide noise to play differently
  const reserve = casual && rng() < 0.15 ? 0 : open.length - 1;
  return Math.max(0, Math.min(me.budget - reserve, Math.round(wtp)));
}

/**
 * One bidding decision on the current lot. Pass `wtp` to reuse the limit worked out at the
 * start of the lot (keeps casual's noise consistent within one card).
 * @returns {{action:"bid", amount:number} | {action:"pass"}}
 */
export function decideAuction({ lot, me, opp, unseen, remaining, difficulty = "strategic", rng = Math.random, wtp = null }) {
  const open = me.roles.filter(r => !me.team.some(x => x.role === r));
  if (lot.solo) {
    // uncontested at $1: take it unless something clearly better for that role is likely to come
    const fit = auctionRoleFor(lot.c, open, unseen, remaining, false);
    const take = remaining < open.length || fit.gain > -1.5 || (difficulty === "casual" && rng() < 0.5);
    return take ? { action: "bid", amount: 1 } : { action: "pass" };
  }
  if (wtp === null) wtp = auctionValue({ c: lot.c, me, opp, unseen, remaining, difficulty, rng });
  if (wtp <= lot.bid || wtp < 1) return { action: "pass" };
  if (!lot.bid) return { action: "bid", amount: Math.max(1, Math.round(wtp * (difficulty === "casual" ? 0.5 : 0.35))) };
  const gap = wtp - lot.bid, step = gap > 12 ? 5 : gap > 4 ? 2 : 1;
  return { action: "bid", amount: Math.min(wtp, lot.bid + step) };
}
