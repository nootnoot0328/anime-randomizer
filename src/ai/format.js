// The in-app referee asks for the same judgement as the copy-paste prompt (same rules,
// same teams), but answers in JSON so the app can show it as a broadcast and store it.
// Kept free of app state so it can be unit-tested.

const LANGUAGE_NAME = { en: "English", zh: "Simplified Chinese", ja: "Japanese" };
export const MARGINS = ["overwhelming", "clear", "moderate", "close", "razor-thin", "even"];
export const BEATS = ["opening", "clash", "turning-point", "betrayal", "endgame"];

/** Output contract appended after the shared judging rules. */
export function refereeFormat(pk, l) {
  const language = LANGUAGE_NAME[l] || "English";
  const betrayal = pk?.kind !== "budget" && pk?.kind !== "auction";
  return `You are now both the REFEREE and the live COMMENTATOR for this match.
Decide the result with the rules above first, then narrate a battle that is consistent with that result.

Reply with ONE JSON object and nothing else (no markdown fences, no text before or after). Write every string value in ${language}. Use character names exactly as they appear in the team lists.

{
  "winner": 1 | 2 | 0,                       // 0 means draw
  "margin": "overwhelming" | "clear" | "moderate" | "close" | "razor-thin" | "even",
  "why": "2–4 short sentences: which roles, counters, reinforcements and synergies decide it",
  "biggestFactor": "1 sentence: the single most decisive factor",
  "mvp": { "player": 1 | 2, "name": "one drafted character", "reason": "1 sentence" },
  "matchups": [                              // one entry per ROLE MATCHUPS line, in the same order
    { "edge": 1 | 2 | 0, "note": "max 12 words: why that side wins the role (0 = even or empty on both)" }
  ],
  "commentary": [                            // 4 to 6 beats, in battle order
    { "beat": "opening" | "clash" | "turning-point"${betrayal ? ' | "betrayal"' : ""} | "endgame", "text": "1–2 vivid sentences of play-by-play" }
  ]
}

Rules for this JSON:
- "margin" must follow the MARGIN GUIDE; use "even" only when "winner" is 0, and never use "even" when there is a winner.
- The commentary must lead naturally to the stated winner. It must not contradict "winner", "margin" or "why".
${betrayal ? "- Include at least one \"betrayal\" beat describing how a traitor turns on their own team.\n" : ""}- "mvp" may come from either team, including the losing one. Leave out "mvp" only if no character was drafted.
- Keep it tight: the whole reply should be under 450 words.`;
}

/* ---------------------------------------------------------------- parsing */

export function extractJSON(text) {
  if (typeof text !== "string") return null;
  const cleaned = text.replace(/```(?:json)?/gi, "");
  const start = cleaned.indexOf("{");
  if (start < 0) return null;
  // walk to the matching brace so trailing chatter doesn't break JSON.parse
  let depth = 0, inStr = false, escNext = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inStr) {
      if (escNext) escNext = false;
      else if (ch === "\\") escNext = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) {
      const raw = cleaned.slice(start, i + 1);
      try { return JSON.parse(raw); } catch {
        // models sometimes leave trailing commas
        try { return JSON.parse(raw.replace(/,\s*([}\]])/g, "$1")); } catch { return null; }
      }
    }
  }
  return null;
}

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
function toSide(v) {
  const n = typeof v === "string" ? Number(v.replace(/\D/g, "") || NaN) : Number(v);
  return n === 1 || n === 2 ? n : n === 0 ? 0 : null;
}

/**
 * Turn the model's reply into a verdict the app trusts, or explain why not.
 * @param {string} text raw model reply
 * @param {{names:string[], matchupCount:number}} ctx drafted names (any language) and number of role rows
 * @returns {{ok:true, verdict:object} | {ok:false, reason:string}}
 */
export function parseVerdict(text, ctx = {}) {
  const o = extractJSON(text);
  if (!o || typeof o !== "object") return { ok: false, reason: "no-json" };
  const winner = toSide(o.winner);
  if (winner === null) return { ok: false, reason: "no-winner" };
  let margin = String(o.margin || "").toLowerCase().trim().replace(/\s+/g, "-");
  if (!MARGINS.includes(margin)) margin = winner === 0 ? "even" : "moderate";
  // a draw is always "even", and a win is never "even"
  if (winner === 0) margin = "even";
  else if (margin === "even") margin = "razor-thin";
  const why = str(o.why, 900);
  if (!why) return { ok: false, reason: "no-reason" };

  const names = (ctx.names || []).filter(Boolean);
  const nameMatch = n => {
    const s = str(n, 120); if (!s) return null;
    return names.find(x => x === s) || names.find(x => x.includes(s) || s.includes(x)) || null;
  };
  let mvp = null;
  if (o.mvp && typeof o.mvp === "object") {
    const side = toSide(o.mvp.player), name = nameMatch(o.mvp.name);
    if ((side === 1 || side === 2) && name) mvp = { player: side, name, reason: str(o.mvp.reason, 300) };
  }
  const count = Number.isInteger(ctx.matchupCount) ? ctx.matchupCount : 0;
  const rawRows = Array.isArray(o.matchups) ? o.matchups : [];
  const matchups = Array.from({ length: count }, (_, i) => {
    const r = rawRows[i] || {};
    const edge = toSide(r.edge);
    return { edge: edge === null ? 0 : edge, note: str(r.note, 160) };
  });
  const commentary = (Array.isArray(o.commentary) ? o.commentary : [])
    .map(b => ({ beat: BEATS.includes(String(b?.beat).toLowerCase()) ? String(b.beat).toLowerCase() : "clash", text: str(b?.text, 400) }))
    .filter(b => b.text)
    .slice(0, 6);
  return { ok: true, verdict: { winner, margin, why, biggestFactor: str(o.biggestFactor, 400), mvp, matchups, commentary } };
}
