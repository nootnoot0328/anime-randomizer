// Every prompt the app copies or sends must match what v0.6.4 produced for the same
// match. The fixture was captured from the running v0.6.4 app (all patch layers on).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { STATE } from "../src/core/state.js";
import { setRoster, resolveCharacter } from "../src/core/roster.js";
import { buildFusionPrompt, buildPKJudgePrompt, buildPKBattleImagePrompt } from "../src/core/prompts.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
setRoster(read("data/roster.json"));
STATE.formPortraits = read("data/form-portraits.json");
const fx = read("tests/fixtures/prompts-v0.6.4.json");

const team = rows => rows.map(r => ({ role: r.role, character: resolveCharacter(r.id, r.phaseKey), price: r.price }));
const match = m => ({ kind: m.kind, opponent: m.opponent, battlefieldSeriesId: m.battlefieldSeriesId,
  p1: { seriesId: m.p1.seriesId, roles: m.p1.roles, team: team(m.p1.team) },
  p2: { seriesId: m.p2.seriesId, roles: m.p2.roles, team: team(m.p2.team) } });

test(`fusion image prompts match v0.6.4 (${fx.fusion.length} games, 3 languages)`, () => {
  for (const [i, f] of fx.fusion.entries()) {
    const assignments = f.assignments.map(a => ({ trait: a.trait, character: resolveCharacter(a.id, a.phaseKey) }));
    assert.equal(buildFusionPrompt(assignments, f.mode, f.scenario, f.lang), f.prompt, `fusion #${i} (${f.lang}, ${f.mode})`);
  }
});
test(`PK judge prompts match v0.6.4 (${fx.pk.length} matches, random + budget)`, () => {
  for (const [i, m] of fx.pk.entries()) assert.equal(buildPKJudgePrompt(match(m), m.lang), m.judge, `judge #${i} (${m.lang}, ${m.kind})`);
});
test("PK battle image prompts match v0.6.4", () => {
  for (const [i, m] of fx.pk.entries()) assert.equal(buildPKBattleImagePrompt(match(m), m.lang), m.image, `image #${i} (${m.lang}, ${m.kind})`);
});
test("referee prompt keeps every judging rule and only swaps the answer format", () => {
  for (const m of fx.pk) {
    const json = buildPKJudgePrompt(match(m), m.lang, "json"), text = buildPKJudgePrompt(match(m), m.lang);
    const head = text.slice(0, text.length - 60);
    const shared = (() => { let i = 0; while (i < json.length && json[i] === text[i]) i++; return i; })();
    assert.ok(shared > text.length * 0.6, "rules section is shared");
    assert.ok(json.includes('"winner"') && json.includes('"commentary"'));
    assert.equal(json.includes('"betrayal"'), m.kind !== "budget", "betrayal beat only when traitors exist");
    assert.ok(head.length > 0);
  }
});
test("Chinese and Japanese referee prompts list characters by their own-language names and forbid switching to English", () => {
  const ids = ["bleach-yhwach", "onepiece-kaido", "jojo-dio-brando", "chainsawman-pochita", "frieren-aura"];
  const mk = (id, role) => ({ role, character: resolveCharacter(id), price: 15 });
  const pk = { kind: "budget", opponent: "local", battlefieldSeriesId: "bleach",
    p1: { seriesId: "bleach", roles: ["Leader", "Co-Leader", "Tanker"], team: [mk(ids[0], "Leader"), mk(ids[1], "Co-Leader"), mk(ids[2], "Tanker")] },
    p2: { seriesId: "bleach", roles: ["Leader", "Co-Leader", "Tanker"], team: [mk(ids[3], "Leader"), mk(ids[4], "Co-Leader")] } };
  const zh = buildPKJudgePrompt(pk, "zh", "json");
  for (const name of ["友哈巴赫", "凯多", "迪奥·布兰度", "波奇塔", "阿乌拉"]) assert.ok(zh.includes(name), name);
  for (const name of ["Yhwach", "Kaido", "Dio Brando", "Pochita", "Aura"]) assert.ok(!zh.includes(name), "English name leaked: " + name);
  assert.match(zh, /never switch to English or romanized names/);
  assert.match(buildPKJudgePrompt(pk, "ja", "json"), /Japanese names shown in the team lists/);
  assert.doesNotMatch(buildPKJudgePrompt(pk, "en", "json"), /never switch to English/);
});
