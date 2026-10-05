// AI character sheet for a finished fusion: one call returns the new character's name,
// title, summary, backstory, a line per trait, dialogue and a signature move.
// Kept free of app state so it can be unit-tested.
import { extractJSON } from "./format.js";

const LANGUAGE_NAME = { en: "English", zh: "Simplified Chinese", ja: "Japanese" };

/** Traits you can see. Everything else has to come through in the story and dialogue. */
export const VISUAL_TRAITS = ["Hair", "Face", "Outfit", "Physique", "Appearance", "Body"];

/** What kind of story each theme asks for. */
export const STORY_DIRECTION = {
  partner: "An ideal partner. Cover how you met, what everyday life together looks like, and what makes them devoted (or not).",
  protagonist: "A shonen-style hero. Cover a humble start, the event that awakened their power, and the goal that drives them.",
  villain: "A villain. Cover the wound or belief behind their Motive, the moment they crossed the line, and what they want now.",
  finalboss: "The final boss. Cover how they rose to absolute power, what they are about to do, and why the heroes must stop them.",
  bestfriend: "A best friend. Cover how the friendship started, the chaos they bring, and the time they had your back.",
  rival: "A rival. Cover what they want to beat the hero at, the defeat that started it, and the respect under the rivalry.",
  mentor: "A mentor. Cover their past glory, the student they lost or failed, and why they teach now.",
  isekai: "An isekai protagonist. Cover their ordinary life and death in our world, the cheat ability they were given, and their new life.",
  adventureparty: "A member of an adventuring party. Cover their role in the party, the quest that brought the party together, and what they bring to camp.",
  roommate: "A roommate. Cover how they ended up sharing the flat, their house habits, and the incident everyone still talks about.",
};

/**
 * @param {{mode:string, modeLabel:string, lang:string, traits:{trait:string, name:string, series:string}[]}} input
 */
export function buildSheetPrompt({ mode, modeLabel, lang, traits }) {
  const language = LANGUAGE_NAME[lang] || "English";
  const lines = traits.map(x => `- ${x.trait}: ${x.name} (${x.series || "unknown series"})`).join("\n");
  const inner = traits.map(x => x.trait).filter(tr => !VISUAL_TRAITS.includes(tr));
  const length = lang === "en" ? "about 120 words in total" : "about 250 characters in total";
  return `You are writing the character sheet for an ORIGINAL anime character created by fusing traits taken from existing characters.

THEME: ${modeLabel || mode}
STORY DIRECTION: ${STORY_DIRECTION[mode] || STORY_DIRECTION.protagonist}

TRAITS (trait: source character (series))
${lines}

Write one believable new character who has all of these traits at once.

Rules:
- The summary, backstory and dialogue take place in the new character's own world. Do not name the source characters or their series there.
- Each trait line says what this character took from that source, and may name the source character.
${inner.length ? `- These traits must visibly shape the backstory or dialogue, not just be listed: ${inner.join(", ")}.\n` : ""}- Write new text. Never quote or closely paraphrase lines from the source works, and do not retell their plots.
- If you do not recognise a source character, use only what their name and series make obvious and keep that trait line general instead of inventing details.
- Suitable for a general audience.
- Write every string value in ${language}.

Reply with ONE JSON object and nothing else (no markdown fences, no text before or after):
{
  "name": "a new name that fits the theme, not a source character's name",
  "title": "an epithet, at most 5 words",
  "summary": "2 sentences: who they are at a glance",
  "backstory": ["2 or 3 short paragraphs", "${length}"],
  "traits": [ { "trait": "trait key exactly as listed above", "line": "at most 10 words" } ],
  "dialogue": ["2 or 3 things they would say, each under 20 words, no speaker labels"],
  "signature": { "name": "their signature move or habit", "text": "1 sentence: what it looks like" }
}

"traits" has one entry per listed trait, in the same order. Keep the whole reply under 400 words.`;
}

const str = (v, max) => (typeof v === "string" ? v.trim().replace(/^["“「]+|["”」]+$/g, "").trim().slice(0, max) : "");

/**
 * Turn the model's reply into a sheet the app trusts, or explain why not.
 * @param {string} text raw model reply
 * @param {{traits:string[]}} ctx trait keys in the order they were sent
 * @returns {{ok:true, sheet:object} | {ok:false, reason:string}}
 */
export function parseSheet(text, ctx = {}) {
  const o = extractJSON(text);
  if (!o || typeof o !== "object") return { ok: false, reason: "no-json" };
  const name = str(o.name, 60);
  if (!name) return { ok: false, reason: "no-name" };
  const summary = str(o.summary, 400);
  let backstory = Array.isArray(o.backstory) ? o.backstory : typeof o.backstory === "string" ? o.backstory.split(/\n\s*\n/) : [];
  backstory = backstory.map(p => str(p, 700)).filter(Boolean).slice(0, 3);
  if (!summary && !backstory.length) return { ok: false, reason: "no-story" };

  const keys = (ctx.traits || []).filter(Boolean);
  const rows = Array.isArray(o.traits) ? o.traits : [];
  const traits = {};
  const norm = s => String(s || "").toLowerCase().replace(/[^a-z]/g, "");
  rows.forEach((r, i) => {
    const line = str(r?.line, 140); if (!line) return;
    // match by key; if the model translated the key, fall back to the position
    const key = keys.find(k => norm(k) === norm(r?.trait)) || (rows.length === keys.length ? keys[i] : null);
    if (key && !traits[key]) traits[key] = line;
  });
  const dialogue = (Array.isArray(o.dialogue) ? o.dialogue : []).map(d => str(typeof d === "string" ? d : d?.text, 200)).filter(Boolean).slice(0, 3);
  const sig = o.signature && typeof o.signature === "object" ? { name: str(o.signature.name, 60), text: str(o.signature.text, 300) } : null;
  return {
    ok: true,
    sheet: { name, title: str(o.title, 60), summary, backstory, traits, dialogue, signature: sig && (sig.name || sig.text) ? sig : null },
  };
}
