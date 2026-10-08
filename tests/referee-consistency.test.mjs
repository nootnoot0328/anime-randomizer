// The referee's arrows must agree with its own notes, the MVP must sit on the right side,
// and the text must name sides the way both phones understand.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { STATE } from "../src/core/state.js";
import { setRoster, resolveCharacter } from "../src/core/roster.js";
import { buildPKJudgePrompt } from "../src/core/prompts.js";
import { parseVerdict, rowEdge } from "../src/ai/format.js";
import { matchupRows } from "../src/ai/referee.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
setRoster(read("data/roster.json"));
STATE.formPortraits = read("data/form-portraits.json");

const rows = [["Chrollo Lucilfer", "Silva Zoldyck"], ["Killua Zoldyck", "Illumi Zoldyck"], [null, "Gon Freecss"]];

test("a row's side comes from the winner's name, not a number", () => {
  assert.equal(rowEdge({ winner: "Silva Zoldyck" }, rows[0]), 2);
  assert.equal(rowEdge({ winner: "Killua Zoldyck", edge: 2 }, rows[1]), 1, "the name wins over a contradicting edge");
  assert.equal(rowEdge({ winner: "Killua" }, rows[1]), 1, "a listed part of the name is enough");
  assert.equal(rowEdge({ winner: "Zoldyck" }, rows[1]), 0, "ambiguous: both names contain it");
  assert.equal(rowEdge({ winner: "even" }, rows[0]), 0);
  assert.equal(rowEdge({ winner: "Hisoka" }, rows[0]), 0, "unknown name shows as even, not a guess");
  assert.equal(rowEdge({ winner: "Gon Freecss" }, rows[2]), 2);
  assert.equal(rowEdge({ edge: 1 }, rows[0]), 1, "older replies with edge still read");
  assert.equal(rowEdge({ winner: "特拉法尔加·罗" }, ["特拉法尔加·罗", "马尔科"]), 1);
  assert.equal(rowEdge({ winner: "马尔科" }, ["特拉法尔加·罗", "马尔科"]), 2);
});

test("the MVP is placed on the team that drafted them, whatever player number the model wrote", () => {
  const reply = JSON.stringify({ winner: 2, margin: "clear", why: "x", mvp: { player: 1, name: "Silva Zoldyck", reason: "r" },
    matchups: [{ winner: "Silva Zoldyck", note: "n" }, { winner: "Killua Zoldyck", note: "n" }, { winner: "Gon Freecss", note: "n" }], commentary: [] });
  const v = parseVerdict(reply, { names: ["Chrollo Lucilfer", "Killua Zoldyck", "Silva Zoldyck", "Illumi Zoldyck", "Gon Freecss"], matchupCount: 3, rows,
    sides: { 1: ["Chrollo Lucilfer", "Killua Zoldyck"], 2: ["Silva Zoldyck", "Illumi Zoldyck", "Gon Freecss"] } }).verdict;
  assert.equal(v.mvp.player, 2);
  assert.deepEqual(v.matchups.map(m => m.edge), [2, 1, 2]);
});

test("the referee prompt names sides by their leader and asks for winners by name", () => {
  const mk = (id, role) => ({ role, character: resolveCharacter(id), price: 15 });
  const roles = ["Leader", "Co-Leader", "Tanker"];
  const pk = { kind: "auction", opponent: "cpu", battlefieldSeriesId: "onepiece",
    p1: { seriesId: "onepiece", roles, team: [mk("onepiece-marshall-d-teach", "Leader"), mk("onepiece-trafalgar-law", "Tanker")] },
    p2: { seriesId: "onepiece", roles, team: [mk("onepiece-portgas-d-ace", "Leader")] } };
  const zh = buildPKJudgePrompt(pk, "zh", "json");
  assert.match(zh, /马歇尔·D·蒂奇队/); assert.match(zh, /波特卡斯·D·艾斯队/);
  assert.match(zh, /never translate what a name means/);
  assert.match(zh, /"winner": "the winning character's name/);
  assert.doesNotMatch(zh, /"edge"/);
  assert.deepEqual(matchupRows(pk, "zh"), [["马歇尔·D·蒂奇", "波特卡斯·D·艾斯"], [null, null], ["特拉法尔加·罗", null]]);
  assert.match(buildPKJudgePrompt(pk, "en", "json"), /call Player 1's side "Marshall D\. Teach's team"/);
});
