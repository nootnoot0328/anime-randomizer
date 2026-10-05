// Computer opponent: rating data integrity and decision behaviour.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const L = require("../logic.js");
globalThis.AnimeFusionLogic = L;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const { STATE } = await import("../src/core/state.js");
const R = await import("../src/core/roster.js");
const C = await import("../src/game/cpu.js");
const { parseAttributes, FORMS, STATS } = await import("../src/data/attributes.js");
const { CHARACTER_PHASES, ROLE_SETS } = await import("../src/data/game.js");
R.setRoster(read("data/roster.json"));
STATE.formPortraits = read("data/form-portraits.json");

function seeded(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const ch = id => R.getCharacter(id);
const role = (series, kind) => R.roleSet(series).find(r => C.roleKind(r) === kind);

/* ---------------------------------------------------------------- data */
test("every roster character has ratings in 0–10, and nothing extra", () => {
  const a = parseAttributes(), ids = read("data/roster.json").flatMap(s => s.chars.map(c => c.id));
  assert.deepEqual(ids.filter(id => !a[id]), [], "missing ratings");
  assert.deepEqual(Object.keys(a).filter(id => !ids.includes(id)), [], "ratings for unknown ids");
  for (const [id, r] of Object.entries(a)) for (const k of STATS) assert.ok(r[k] >= 0 && r[k] <= 10, `${id}.${k}=${r[k]}`);
});
test("form overrides only name real forms and real stats", () => {
  for (const [id, forms] of Object.entries(FORMS)) for (const [key, o] of Object.entries(forms)) {
    assert.ok(CHARACTER_PHASES[id]?.some(f => f.key === key), `${id}::${key} is not a form`);
    for (const k of Object.keys(o)) assert.ok(STATS.includes(k), `${id}::${key}.${k}`);
  }
  assert.ok(C.attributes(R.withCharacterPhase(ch("onepiece-monkey-d-luffy"), { key: "gear5", en: "", zh: "", ja: "" })).power > C.attributes(R.withCharacterPhase(ch("onepiece-monkey-d-luffy"), { key: "prets", en: "", zh: "", ja: "" })).power);
});
test("every series has exactly one role of each kind", () => {
  for (const [series, roles] of Object.entries(ROLE_SETS)) assert.deepEqual(roles.map(C.roleKind).sort(), ["deputy", "heal", "intel", "lead", "tank", "traitor"], series);
});
test("ratings agree with canon on the obvious cases", () => {
  for (const id of ["onepiece-tony-tony-chopper", "naruto-tsunade", "jjk-shoko-ieiri", "bleach-orihime-inoue", "bleach-retsu-unohana", "fairytail-wendy-marvell", "jojo-josuke-higashikata", "frieren-heiter", "blackclover-mimosa-vermillion", "fma-may-chang"])
    assert.ok(C.attributes(ch(id)).heal >= 9, `${id} is a healer`);
  for (const id of ["onepiece-kaido", "bleach-kenpachi-zaraki", "dragonball-broly"]) assert.ok(C.attributes(ch(id)).heal === 0, `${id} doesn't heal`);
  for (const id of ["naruto-shikamaru-nara", "aot-armin-arlert", "aot-erwin-smith", "fairytail-mavis-vermillion", "spyfamily-loid-forger"]) assert.ok(C.attributes(ch(id)).intel >= 10, `${id} is a strategist`);
});

/* ---------------------------------------------------------------- Random PK */
const OP = R.pkCharacters(R.getSeries("onepiece").chars);
test("a real healer goes to the healer slot even when a stronger fighter is offered", () => {
  const d = C.decideRandom({ pair: [ch("onepiece-kaido"), ch("onepiece-tony-tony-chopper")], openRoles: [role("onepiece", "lead"), role("onepiece", "heal")], pool: OP });
  assert.equal(d.action, "pick"); assert.equal(d.index, 1); assert.equal(C.roleKind(d.role), "heal");
});
test("the strongest card never becomes the traitor while a real role is open", () => {
  const d = C.decideRandom({ pair: [ch("onepiece-shanks"), ch("onepiece-usopp")], openRoles: [role("onepiece", "traitor"), role("onepiece", "deputy")], pool: OP });
  assert.ok(!(d.index === 0 && C.roleKind(d.role) === "traitor"));
});
test("with only the traitor slot left, a weak character is preferred", () => {
  const d = C.decideRandom({ pair: [ch("onepiece-shanks"), ch("onepiece-usopp")], openRoles: [role("onepiece", "traitor")], pool: OP });
  assert.equal(d.index, 1);
});
test("skips a pair only when both cards are clearly below what the pool offers", () => {
  const weak = [ch("onepiece-usopp"), ch("onepiece-nami")], strongRoles = [role("onepiece", "lead"), role("onepiece", "tank")];
  assert.equal(C.decideRandom({ pair: weak, openRoles: strongRoles, pool: OP, canSkip: true }).action, "skip");
  assert.equal(C.decideRandom({ pair: weak, openRoles: strongRoles, pool: OP, canSkip: false }).action, "pick", "no skip left: must pick");
  assert.equal(C.decideRandom({ pair: [ch("onepiece-shanks"), ch("onepiece-kaido")], openRoles: strongRoles, pool: OP, canSkip: true }).action, "pick");
});

function simulate(policy, rng, drafts = 15) {
  let healerOffered = 0, healerTaken = 0, traitorPower = 0, n = 0;
  for (const s of R.allSeries().map(x => x.id)) for (let i = 0; i < drafts; i++) {
    let pool = R.pkCharacters(R.getSeries(s).chars), skips = 1, offered = false; const roles = R.roleSet(s), team = [];
    while (team.length < 6) {
      const pair = L.shuffle(pool, rng).slice(0, 2), open = roles.filter(r => !team.some(t => t.role === r));
      if (open.some(r => C.roleKind(r) === "heal") && pair.some(c => C.attributes(c).heal >= 6)) offered = true;
      let pick, r;
      if (policy === "v1.0.0") { pick = pair.map(c => ({ c, s: R.characterPrice(c) + rng() })).sort((a, b) => b.s - a.s)[0].c; r = open[0]; }
      else { const d = C.decideRandom({ pair, openRoles: open, pool, difficulty: policy, canSkip: skips > 0, rng }); if (d.action === "skip") { skips = 0; continue; } pick = pair[d.index]; r = d.role; }
      team.push({ role: r, character: pick }); pool = pool.filter(x => x.id !== pick.id);
    }
    n++; traitorPower += C.attributes(team.find(x => C.roleKind(x.role) === "traitor").character).power;
    if (offered) { healerOffered++; if (team.some(x => C.roleKind(x.role) === "heal" && C.attributes(x.character).heal >= 6)) healerTaken++; }
  }
  return { healerRate: healerTaken / healerOffered, traitorPower: traitorPower / n };
}
test("strategic: takes an offered healer as healer ≥90% of the time and fields far weaker traitors than v1.0.0", () => {
  const s = simulate("strategic", seeded(7)), old = simulate("v1.0.0", seeded(7)), casual = simulate("casual", seeded(7));
  assert.ok(s.healerRate >= 0.9, `healer rate ${s.healerRate}`);
  assert.ok(s.traitorPower < old.traitorPower - 1.5, `traitor power ${s.traitorPower} vs ${old.traitorPower}`);
  assert.ok(casual.healerRate < s.healerRate && casual.healerRate > old.healerRate, "casual sits between");
});

/* ---------------------------------------------------------------- Budget PK */
test("budget plan respects the budget, uses each character once and fills real roles well", () => {
  const roles = R.budgetRoleSet("onepiece"), plan = C.planBudget(OP, roles, 100, R.characterPrice);
  assert.ok(100 - plan.money <= 100 && plan.picks.reduce((s, x) => s + x.price, 0) === 100 - plan.money);
  assert.equal(new Set(plan.picks.map(x => x.character.id)).size, plan.picks.length);
  assert.equal(plan.picks.length, 5);
  const doctor = plan.picks.find(x => C.roleKind(x.role) === "heal");
  assert.ok(C.attributes(doctor.character).heal >= 8, `doctor is ${doctor.character.name_en}`);
});
test("budget: buys the priciest part of its plan first, and sells a bad fit when it clearly pays", () => {
  const roles = R.budgetRoleSet("onepiece");
  const d = C.decideBudget({ pool: OP, team: [], openRoles: roles, budget: 100, sellUsed: false, price: R.characterPrice });
  assert.equal(d.action, "buy"); assert.equal(R.characterPrice(d.character), Math.max(...C.planBudget(OP, roles, 100, R.characterPrice).picks.map(x => x.price)));
  // spent $90 on three $30 stars, one wasted in the doctor slot, $10 left for two roles
  const stars = ["onepiece-kaido", "onepiece-shanks", "onepiece-edward-newgate"].map(ch);
  const team = [{ role: role("onepiece", "heal"), character: stars[0], price: 30 }, { role: role("onepiece", "lead"), character: stars[1], price: 30 }, { role: role("onepiece", "deputy"), character: stars[2], price: 30 }];
  const pool = OP.filter(c => !stars.some(s => s.id === c.id));
  const open = roles.filter(r => !team.some(t => t.role === r));
  const s = C.decideBudget({ pool, team, openRoles: open, budget: 10, sellUsed: false, price: R.characterPrice });
  assert.equal(s.action, "sell"); assert.equal(C.roleKind(s.role), "heal");
  assert.notEqual(C.decideBudget({ pool, team, openRoles: open, budget: 10, sellUsed: true, price: R.characterPrice }).action, "sell", "only one sale");
});
test("budget: finishes when nothing affordable helps", () => {
  assert.equal(C.decideBudget({ pool: OP.filter(c => R.characterPrice(c) >= 15), team: [{ role: role("onepiece", "lead"), character: ch("onepiece-shanks"), price: 30 }], openRoles: R.budgetRoleSet("onepiece").slice(1), budget: 5, sellUsed: true, price: R.characterPrice }).action, "finish");
});
