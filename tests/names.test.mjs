// Every character, form and series has a real name in all three languages.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const roster = JSON.parse(fs.readFileSync(path.join(root, "data/roster.json"), "utf8"));
const { CHARACTER_PHASES } = await import("../src/data/game.js");
const KANA = /[぀-ヿ]/;
// Japanese-only or traditional character forms that should never appear in Simplified Chinese
const NOT_SIMPLIFIED = /[國體黒壺間禪裏醫學會讀龍劍鬥萬與將頭幾關變聲廣應來後時沢]/;
const SAME_EVERYWHERE = new Set(["codegeass-cc", "codegeass-vv"]);
const chars = roster.flatMap(s => s.chars.map(c => ({ ...c, series: s.id })));

test("every character has an English, Chinese and Japanese name, with no stray spaces", () => {
  const bad = chars.filter(c => ["name_en", "name_zh", "name_ja"].some(k => !c[k] || c[k] !== c[k].trim()));
  assert.deepEqual(bad.map(c => c.id), []);
});

test("Chinese names are translated: not the English name, no Japanese kana, Simplified characters", () => {
  const copied = chars.filter(c => c.name_zh === c.name_en && !SAME_EVERYWHERE.has(c.id)).map(c => c.id);
  const kana = chars.filter(c => KANA.test(c.name_zh)).map(c => `${c.id}: ${c.name_zh}`);
  const forms = chars.filter(c => NOT_SIMPLIFIED.test(c.name_zh)).map(c => `${c.id}: ${c.name_zh}`);
  assert.deepEqual(copied, [], "English copied into name_zh");
  assert.deepEqual(kana, [], "kana in name_zh");
  assert.deepEqual(forms, [], "Japanese/traditional forms in name_zh");
});

test("Japanese names are Japanese (except official Latin names) and use katakana ニ, not the kanji 二, in foreign names", () => {
  const copied = chars.filter(c => c.name_ja === c.name_en && !SAME_EVERYWHERE.has(c.id)).map(c => c.id);
  assert.deepEqual(copied, []);
  const kanjiTwo = chars.filter(c => /[ァ-ヶー]二|二[ァ-ヶー]/.test(c.name_ja)).map(c => c.id);
  assert.deepEqual(kanjiTwo, []);
});

test("every form label exists in all three languages, and Chinese labels are translated", () => {
  const bad = [];
  for (const [id, forms] of Object.entries(CHARACTER_PHASES)) for (const f of forms) {
    if (!f.en || !f.zh || !f.ja || KANA.test(f.zh) || /[A-Za-z]{4,}/.test(f.zh)) bad.push(`${id}/${f.key}`);
  }
  assert.deepEqual(bad, []);
});

test("every series has names in all three languages", () => {
  assert.deepEqual(roster.filter(s => !s.name_en || !s.name_zh || !s.name_ja).map(s => s.id), []);
});
