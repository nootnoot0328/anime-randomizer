// Every character has a one-line bio in all three languages.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const roster = read("data/roster.json");
const ids = roster.flatMap(s => s.chars.map(c => c.id));

for (const l of ["en", "zh", "ja"]) test(`bios: ${l} covers every character, one short line each`, () => {
  const b = read(`data/bios-${l}.json`);
  assert.deepEqual(ids.filter(id => !b[id]), [], "missing");
  assert.deepEqual(Object.keys(b).filter(id => !ids.includes(id)), [], "orphans");
  const tooLong = ids.filter(id => (l === "en" ? b[id].split(/\s+/).length > 26 : b[id].length > 60) || /\n/.test(b[id]));
  assert.deepEqual(tooLong, []);
  if (l === "zh") assert.deepEqual(ids.filter(id => /[぀-ヿ]/.test(b[id])), [], "kana in Chinese");
});
