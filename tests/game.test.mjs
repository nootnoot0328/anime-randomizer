// Behaviour tests for the v1 game logic (no browser). Covers the rules ported from
// v0.6.4 and the fixes made in v1.
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
const { app } = await import("../src/core/app.js");
const R = await import("../src/core/roster.js");
const P = await import("../src/game/pk.js");
const F = await import("../src/game/fusion.js");
const H = await import("../src/core/history.js");
const { parseVerdict, refereeFormat } = await import("../src/ai/format.js");

R.setRoster(read("data/roster.json"));
STATE.formPortraits = read("data/form-portraits.json");
const toasts = [];
Object.assign(app, { render() {}, go(s) { STATE.screen = s; }, toast(m) { toasts.push(m); }, haptic() {}, matchComplete() {} });
const wait = ms => new Promise(r => setTimeout(r, ms));
const roster = read("data/roster.json");

/* ---------------------------------------------------------------- data */
test("every series has six localized PK roles (traitor last) and a battlefield", async () => {
  const { ROLE_SETS, ROLE_LABELS, BATTLEFIELDS } = await import("../src/data/game.js");
  for (const s of roster) {
    assert.equal(ROLE_SETS[s.id]?.length, 6, s.id);
    assert.match(ROLE_SETS[s.id][5], /:traitor$/, `${s.id} traitor is the sixth role`);
    for (const r of ROLE_SETS[s.id]) for (const l of ["en", "zh", "ja"]) assert.ok(ROLE_LABELS[r]?.[l]?.trim(), `${r} ${l}`);
    for (const l of ["en", "zh", "ja"]) assert.ok(BATTLEFIELDS[s.id]?.[l]?.trim(), `${s.id} battlefield ${l}`);
  }
});
test("every v1 string exists in all three languages", async () => {
  const { STRINGS_V1 } = await import("../src/data/strings-v1.js");
  for (const k of Object.keys(STRINGS_V1.en)) for (const l of ["zh", "ja"]) assert.ok(STRINGS_V1[l][k], `${l}.${k}`);
});
test("every t() key used in src resolves to a real string", async () => {
  const { STRINGS } = await import("../src/data/strings.js");
  const { STRINGS_V1 } = await import("../src/data/strings-v1.js");
  const known = new Set([...Object.keys(STRINGS.en), ...Object.keys(STRINGS_V1.en)]);
  const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : p.endsWith(".js") && files.push(p); } })(path.join(root, "src"));
  for (const f of files) for (const m of fs.readFileSync(f, "utf8").matchAll(/\bt\("([A-Za-z0-9_]+)"\s*[,)]/g)) assert.ok(known.has(m[1]), `${path.basename(f)} uses unknown key ${m[1]}`);
  // dynamic families
  for (const k of ["beat_opening", "beat_clash", "beat_turning_point", "beat_betrayal", "beat_endgame", "margin_overwhelming", "margin_clear", "margin_moderate", "margin_close", "margin_razor_thin", "margin_even", "judgedIn_en", "judgedIn_zh", "judgedIn_ja",
    "refError_badKey", "refError_limit", "refError_scope", "refError_noProvider", "refError_server", "refError_unreadable", "refError_timeout", "refError_offline", "refError_cancelled",
    "aiTest_ok", "aiTest_badUrl", "aiTest_noKey", "aiTest_unreachable", "aiTest_noProvider", "aiTest_noGameKey", "aiTest_isAppKey", "aiTest_badKey", "aiTest_unexpected", "aiTest_timeout",
    "needSeries", "needTrait", "needCharacters", "needUniqueCharacters", "aiRefereeOn", "aiRefereeOff", "aiRefereeOnDesc", "aiRefereeOffDesc", "player1", "player2", "on", "off"]) assert.ok(known.has(k), k);
});
test("only manually verified form portraits enter pools, and forms are siblings", () => {
  const forms = read("data/form-portraits.json").variants;
  for (const [key, rec] of Object.entries(forms)) assert.equal(rec.verified, true, key);
  const luffy = R.getCharacter("onepiece-monkey-d-luffy");
  const variants = R.characterPhaseVariants(luffy);
  assert.ok(variants.length >= 2 && variants.every(v => v.id === luffy.id && v.phaseKey), "forms share the base id");
  STATE.formPortraits = { variants: {} };
  assert.deepEqual(R.characterPhaseVariants(luffy), [luffy], "unverified forms fall back to the base character");
  STATE.formPortraits = read("data/form-portraits.json");
});

/* ---------------------------------------------------------------- fusion */
test("discard mode needs a spare character in Trait Draft, none in Quick", () => {
  STATE.selectedSeries = new Set(["onepiece"]); STATE.genderFilter = "all"; STATE.poolMode = "discard";
  const n = R.characterIdentityCount(R.selectedPool());
  STATE.selectedTraits = new Set(Array.from({ length: n }, (_, i) => `t${i}`));
  assert.equal(F.setupProblem("standard"), "needUniqueCharacters");
  assert.equal(F.setupProblem("quick"), null);
  STATE.selectedTraits = new Set(["Hair"]); STATE.poolMode = "repeat";
  assert.equal(F.setupProblem("standard"), null);
  STATE.selectedSeries = new Set(); assert.equal(F.setupProblem(), "needSeries");
});
test("assigning a form removes its sibling forms from a repeat-mode pool", () => {
  const luffy = R.getCharacter("onepiece-monkey-d-luffy"), [a, b] = R.characterPhaseVariants(luffy), other = R.getCharacter("onepiece-nami");
  STATE.game = { kind: "standard", mode: "partner", poolMode: "repeat", pool: [a, b, other], remaining: ["Hair", "Body"], assignments: [], selected: a, revealing: false, skips: 3 };
  STATE.screen = "draft";
  F.assignTrait("Hair");
  clearInterval(STATE.game.revealTimer);
  assert.ok(STATE.game.pool.some(c => c.phaseKey === a.phaseKey) && !STATE.game.pool.some(c => c.phaseKey === b.phaseKey));
  assert.deepEqual(STATE.game.remaining, ["Body"]);
});
test("saved fusions are de-duplicated and keep their scenario", () => {
  STATE.history = [];
  const c = R.getCharacter("jjk-satoru-gojo");
  const g = { kind: "standard", mode: "rival", promptScenario: 2, assignments: [{ trait: "Power", character: c }] };
  assert.equal(H.saveFusion(g), "saved"); assert.equal(H.saveFusion(g), "duplicate");
  assert.equal(STATE.history[0].type, "fusion"); assert.equal(STATE.history[0].scenario, 2);
});

/* ---------------------------------------------------------------- PK */
function newMatch(kind, setup = {}) {
  STATE.pkSetup = { kind, p1: "naruto", p2: "onepiece", pool: "onepiece", opponent: "local", difficulty: "strategic", ...setup };
  STATE.screen = "pksetup";
  P.startPK(); P.cancelPKTimers();
  return STATE.pk;
}
test("budget PK: five roles, $100 each, one sale with refund, early finish, then the match is saved", () => {
  STATE.history = [];
  const pk = newMatch("budget");
  assert.equal(pk.p1.roles.length, 5); assert.ok(!pk.p1.roles.some(R.isTraitorRole));
  const pool = P.budgetPool();
  for (let i = 1; i < pool.length; i++) assert.ok(R.characterPrice(pool[i - 1]) >= R.characterPrice(pool[i]), "roster sorted by price");
  const star = pool[0], price = R.characterPrice(star);
  P.assignPKCharacter(pk.p1.roles[0], star);
  assert.equal(pk.p1.budget, 100 - price); assert.equal(pk.turn, 2);
  P.assignPKCharacter(pk.p2.roles[0], P.budgetPool()[0]);
  P.sellBudgetCharacter(1, pk.p1.roles[0]);
  assert.equal(pk.p1.budget, 100); assert.equal(pk.p1.sellUsed, true); assert.ok(!pk.used.has(star.id), "sold character returns to the pool");
  P.sellBudgetCharacter(1, pk.p1.roles[0]); assert.equal(pk.p1.budget, 100, "only one sale");
  P.assignPKCharacter(pk.p1.roles[1], P.budgetPool().at(-1));
  P.finishBudgetTeam(); // P2 still has a character, so it can finish
  assert.equal(pk.p2.finished, true);
  P.finishBudgetTeam(); // P1
  assert.ok(P.pkOver(pk)); assert.equal(STATE.history[0].type, "battle"); assert.equal(STATE.history[0].p1.team.length, 1);
});
test("budget PK: can't buy over budget, and can't finish with an empty team", () => {
  const pk = newMatch("budget");
  pk.p1.budget = 5;
  const pricey = P.budgetPool().find(c => R.characterPrice(c) > 5);
  P.assignPKCharacter(pk.p1.roles[0], pricey);
  assert.equal(pk.p1.team.length, 0);
  P.finishBudgetTeam(); assert.equal(pk.p1.finished, false); assert.ok(toasts.length);
});
test("random PK alternates turns, never repeats a character and ends after 12 picks", () => {
  const pk = newMatch("random");
  for (let i = 0; i < 12; i++) {
    const n = pk.turn, c = P.pkPool(n)[0];
    P.assignPKCharacter(P.openRoles(n)[0], c); P.cancelPKTimers();
    if (i < 11) assert.equal(pk.turn, n === 1 ? 2 : 1);
  }
  assert.ok(P.pkComplete(pk));
  const ids = [...pk.p1.team, ...pk.p2.team].map(x => x.character.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok([pk.p1.seriesId, pk.p2.seriesId].includes(pk.battlefieldSeriesId), "battlefield is one of the two home series");
});
test("strategic CPU uses its skip on a cheap pair instead of freezing (v0.6.4 bug)", async () => {
  const pk = newMatch("random", { opponent: "cpu", p1: "naruto", p2: "onepiece" });
  STATE.screen = "pk";
  const cheap = P.pkPool(2).filter(c => R.characterPrice(c) <= 10);
  assert.ok(cheap.length >= 2, "One Piece has two $10 characters");
  pk.turn = 2; pk.pair = cheap.slice(0, 2); pk.revealing = false;
  const before = pk.pair.map(c => c.id).join();
  P.resumePK();
  await wait(2600);
  P.cancelPKTimers();
  const progressed = pk.skips[2] === 0 || pk.p2.team.length === 1;
  assert.ok(progressed, "CPU skipped or picked");
  assert.equal(pk.skips[2], 0, "the strategic CPU spent its skip");
  assert.notEqual(pk.pair.map(c => c.id).join(), before, "a new pair was drawn");
});
test("a human can't act during the CPU's turn", () => {
  const pk = newMatch("random", { opponent: "cpu" });
  pk.turn = 2; pk.pair = P.pkPool(2).slice(0, 2); pk.revealing = false; pk.skips[2] = 1;
  P.skipPKPair(); assert.equal(pk.skips[2], 1);
  pk.selectedIndex = 0; P.assignSelectedPKRole(2, pk.p2.roles[0]); assert.equal(pk.p2.team.length, 0);
});

/* ---------------------------------------------------------------- referee parsing */
const ctx = { names: ["Monkey D. Luffy", "Roronoa Zoro", "Naruto Uzumaki"], matchupCount: 5 };
test("verdicts are parsed from fenced or chatty replies and normalised", () => {
  const r = parseVerdict('Sure!\n```json\n{"winner": "2", "margin": "Razor thin", "why": "Zoro holds.", "mvp": {"player": 2, "name": "Zoro"}, "matchups": [{"edge": 2, "note": "x"}], "commentary": [{"beat": "opening", "text": "Go"}, {"beat": "weird", "text": "Then"}],}\n```\nHope that helps', ctx);
  assert.equal(r.ok, true);
  assert.equal(r.verdict.winner, 2); assert.equal(r.verdict.margin, "razor-thin");
  assert.equal(r.verdict.mvp.name, "Roronoa Zoro", "MVP matched back to a drafted name");
  assert.equal(r.verdict.matchups.length, 5); assert.equal(r.verdict.matchups[0].edge, 2); assert.equal(r.verdict.matchups[4].edge, 0);
  assert.equal(r.verdict.commentary[1].beat, "clash", "unknown beats become clashes");
});
test("draw/margin consistency is enforced and junk is rejected", () => {
  assert.equal(parseVerdict('{"winner":0,"margin":"clear","why":"tie"}', ctx).verdict.margin, "even");
  assert.equal(parseVerdict('{"winner":1,"margin":"even","why":"close"}', ctx).verdict.margin, "razor-thin");
  assert.equal(parseVerdict('{"winner":1,"why":"x","mvp":{"player":1,"name":"Goku"}}', ctx).verdict.mvp, null, "invented MVP dropped");
  assert.equal(parseVerdict("RESULT: Player 1 wins", ctx).ok, false);
  assert.equal(parseVerdict('{"winner":3,"why":"x"}', ctx).ok, false);
  assert.equal(parseVerdict('{"winner":1}', ctx).ok, false);
  assert.equal(parseVerdict('{"winner":1,"why":"has } brace","commentary":[{"text":"a \\"quote\\" }"}]}', ctx).ok, true, "braces inside strings");
});
test("referee format asks for the app language and only mentions betrayal when traitors exist", () => {
  assert.match(refereeFormat({ kind: "random" }, "ja"), /Japanese/);
  assert.match(refereeFormat({ kind: "random" }, "zh"), /"betrayal"/);
  assert.doesNotMatch(refereeFormat({ kind: "budget" }, "en"), /"betrayal"/);
});
test("a stored verdict is attached to the saved battle", () => {
  STATE.history = [];
  const pk = newMatch("random");
  for (let i = 0; i < 12; i++) { const n = pk.turn; P.assignPKCharacter(P.openRoles(n)[0], P.pkPool(n)[0]); P.cancelPKTimers(); }
  const v = parseVerdict('{"winner":1,"margin":"clear","why":"x"}', ctx).verdict;
  H.attachVerdict(pk.historyId, { verdict: v, lang: "en" });
  const back = H.battleFromEntry(STATE.history.find(h => h.id === pk.historyId));
  assert.equal(back.referee.verdict.winner, 1); assert.equal(back.p1.team.length, 6); assert.ok(back.fromHistory);
});
