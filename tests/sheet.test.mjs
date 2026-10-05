// Character sheet: prompt contract and the parser that decides what the app trusts.
import test from "node:test";
import assert from "node:assert/strict";
import { buildSheetPrompt, parseSheet, STORY_DIRECTION, VISUAL_TRAITS } from "../src/ai/sheet-format.js";
import { MODES } from "../src/data/game.js";

const traits = [
  { trait: "Hair", name: "Satoru Gojo", series: "Jujutsu Kaisen" },
  { trait: "Intelligence", name: "L Lawliet", series: "Death Note" },
  { trait: "Romance", name: "Yor Forger", series: "SPY x FAMILY" },
  { trait: "Weapon", name: "Roronoa Zoro", series: "One Piece" },
];

test("every theme has a story direction", () => {
  for (const mode of Object.keys(MODES)) assert.ok(STORY_DIRECTION[mode], mode);
});

test("prompt lists traits, names the theme, language and the non-visual traits that must shape the story", () => {
  const p = buildSheetPrompt({ mode: "villain", modeLabel: "Villain", lang: "ja", traits });
  assert.match(p, /THEME: Villain/);
  assert.match(p, /STORY DIRECTION: A villain\./);
  assert.match(p, /- Intelligence: L Lawliet \(Death Note\)/);
  assert.match(p, /in Japanese\./);
  assert.match(p, /must visibly shape the backstory or dialogue, not just be listed: Intelligence, Romance, Weapon\./);
  assert.doesNotMatch(p, /listed: Hair/);
  assert.match(p, /Never quote or closely paraphrase/);
  assert.match(p, /about 250 characters/);
  assert.match(buildSheetPrompt({ mode: "partner", modeLabel: "Partner", lang: "en", traits }), /about 120 words/);
});

test("prompt falls back to the protagonist direction for an unknown theme, and skips the rule when every trait is visual", () => {
  const p = buildSheetPrompt({ mode: "nope", lang: "en", traits: [{ trait: "Hair", name: "A", series: "B" }] });
  assert.match(p, /shonen-style hero/);
  assert.doesNotMatch(p, /must visibly shape/);
  assert.ok(VISUAL_TRAITS.includes("Physique"));
});

const good = {
  name: "Kael Mirevoss", title: "The Silent Verdict", summary: "A swordsman who solves crimes. He is terrible at love.",
  backstory: ["First paragraph.", "Second paragraph.", "Third.", "Fourth gets dropped."],
  traits: [{ trait: "Hair", line: "White spikes, never combed" }, { trait: "intelligence", line: "Reads a room in seconds" }, { trait: "Weapon", line: "Three blades, one in his teeth" }],
  dialogue: ["“I already know how this ends.”", { text: "Sit. You're in my light." }, "Third.", "Fourth dropped."],
  signature: { name: "Verdict Cut", text: "One step, three arcs of light." },
};

test("parses a good reply, inside fences and chatter, and normalises it", () => {
  const r = parseSheet("Sure!\n```json\n" + JSON.stringify(good) + "\n```\nHope that helps", { traits: traits.map(x => x.trait) });
  assert.equal(r.ok, true);
  const s = r.sheet;
  assert.equal(s.name, "Kael Mirevoss");
  assert.equal(s.backstory.length, 3);
  assert.equal(s.traits.Intelligence, "Reads a room in seconds"); // key matched case-insensitively
  assert.equal(s.traits.Romance, undefined); // missing line: the app shows the donor instead
  assert.deepEqual(s.dialogue, ["I already know how this ends.", "Sit. You're in my light.", "Third."]);
  assert.equal(s.signature.name, "Verdict Cut");
});

test("translated trait keys fall back to position when the count matches", () => {
  const o = { ...good, traits: [{ trait: "髪", line: "a" }, { trait: "知力", line: "b" }, { trait: "恋愛", line: "c" }, { trait: "武器", line: "d" }] };
  const r = parseSheet(JSON.stringify(o), { traits: traits.map(x => x.trait) });
  assert.deepEqual(r.sheet.traits, { Hair: "a", Intelligence: "b", Romance: "c", Weapon: "d" });
});

test("backstory as one string is split into paragraphs; trailing commas are tolerated", () => {
  const raw = JSON.stringify({ ...good, backstory: "One.\n\nTwo." }).replace(/}$/, ",}");
  const r = parseSheet(raw, { traits: [] });
  assert.deepEqual(r.sheet.backstory, ["One.", "Two."]);
});

test("rejects replies the app can't use", () => {
  assert.deepEqual(parseSheet("no json here"), { ok: false, reason: "no-json" });
  assert.deepEqual(parseSheet(JSON.stringify({ ...good, name: "" })), { ok: false, reason: "no-name" });
  assert.deepEqual(parseSheet(JSON.stringify({ name: "X", summary: "", backstory: [] })), { ok: false, reason: "no-story" });
});

test("caps lengths and drops an empty signature", () => {
  const r = parseSheet(JSON.stringify({ ...good, name: "N".repeat(200), signature: { name: "", text: "" } }), { traits: [] });
  assert.equal(r.sheet.name.length, 60);
  assert.equal(r.sheet.signature, null);
});

test("the copy-paste version asks for the same sheet as readable text, not JSON", () => {
  const p = buildSheetPrompt({ mode: "partner", modeLabel: "Partner", lang: "zh", traits, format: "text" });
  assert.match(p, /Use exactly this layout:/);
  assert.match(p, /NAME \(new, not a source character's name\) — TITLE/);
  assert.match(p, /Write everything in Simplified Chinese\./);
  assert.doesNotMatch(p, /JSON/);
  // same content rules as the in-app call
  assert.match(p, /Never quote or closely paraphrase/);
  assert.match(p, /not just be listed: Intelligence, Romance, Weapon\./);
});
