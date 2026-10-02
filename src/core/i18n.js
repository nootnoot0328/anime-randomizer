// Language lookups. Everything takes the language from STATE unless one is passed,
// so prompt builders can be tested for any language without touching app state.
import { STRINGS } from "../data/strings.js";
import { STRINGS_V1 } from "../data/strings-v1.js";
import { TRAIT_LABELS, ROLE_LABELS } from "../data/game.js";
import { STATE } from "./state.js";

export const LANGS = ["en", "zh", "ja"];
export function lang() { return LANGS.includes(STATE.lang) ? STATE.lang : "en"; }

export function t(key, vars = {}, l = lang()) {
  let s = STRINGS_V1[l]?.[key] ?? STRINGS[l]?.[key] ?? STRINGS_V1.en[key] ?? STRINGS.en[key] ?? key;
  for (const [a, b] of Object.entries(vars)) s = s.replaceAll(`{${a}}`, String(b));
  return s;
}
export function traitLabel(key, l = lang()) { return l === "en" ? key : (TRAIT_LABELS[key]?.[l] || key); }
export function roleLabel(key, l = lang()) {
  const item = ROLE_LABELS[key];
  if (!item) return key;
  return item[l] || item.en || key;
}
export function displayName(c, l = lang()) { if (!c) return ""; return c[`name_${l}`] || c.name || c.name_en || ""; }
export function secondaryName(c, l = lang()) { if (!c) return ""; return l === "en" ? (c.name_ja || c.name_zh || "") : (c.name_en || c.name || ""); }
export function displaySeries(s, l = lang()) { if (!s) return ""; return s[`name_${l}`] || s.name || s.name_en || s.series || ""; }
/** The series a character belongs to, in the current language. */
export function charSeries(c, l = lang()) { if (!c) return ""; return c[`series_${l}`] || c.series_en || c.series || ""; }
export function initials(name) {
  if (typeof name !== "string" || !name.trim()) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map(x => x[0] || "").join("").toUpperCase() || "?";
}
// Names used inside AI prompts: the app language, falling back to English.
export function promptCharacterName(c, l = lang()) {
  if (!c) return "";
  if (l === "zh") return c.name_zh || c.name_en || c.name || "";
  if (l === "ja") return c.name_ja || c.name_en || c.name || "";
  return c.name_en || c.name || "";
}
export function promptSeriesName(c, l = lang()) {
  if (!c) return "";
  if (l === "zh") return c.series_zh || c.series_en || c.series || "";
  if (l === "ja") return c.series_ja || c.series_en || c.series || "";
  return c.series_en || c.series || "";
}
