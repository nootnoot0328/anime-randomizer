// Roster, pools, character forms (phases), prices and PK role sets.
// Pure functions over STATE; no DOM.
import { CHARACTER_PHASES, PRICE_OVERRIDES, ROLE_SETS } from "../data/game.js";
import { roleScore, attributes } from "../game/cpu.js";
import { STATE } from "./state.js";

export function setRoster(roster) {
  STATE.builtin = roster.map(s => ({
    ...s, name: s.name_en,
    chars: (s.chars || []).map(c => ({ ...c, name: c.name_en, series: s.name_en, series_en: s.name_en, series_ja: s.name_ja, series_zh: s.name_zh, seriesId: s.id })),
  }));
  CHAR_INDEX = null; SERIES_VALUES.clear();
}
let CHAR_INDEX = null;
export function allSeries() { return STATE.builtin; }
export function getSeries(id) { return STATE.builtin.find(s => s.id === id); }
export function allCharacters() { return STATE.builtin.flatMap(s => s.chars || []); }
export function getCharacter(id) {
  if (!CHAR_INDEX) CHAR_INDEX = new Map(allCharacters().map(c => [c.id, c]));
  return CHAR_INDEX.get(id);
}

/* ---- forms / eras -------------------------------------------------------
   A form is a hidden variant of one character. Variants keep the base id so
   discard mode and PK remove every sibling form once one is taken. Only forms
   with a manually verified portrait enter the pools. */
export function phaseOptionsFor(c) { return CHARACTER_PHASES[c?.id] || null; }
export function withCharacterPhase(c, ph) {
  const variantKey = `${c.id}::${ph.key}`, record = STATE.formPortraits?.variants?.[variantKey] || null;
  const out = { ...c, phaseKey: ph.key, phase_en: ph.en, phase_zh: ph.zh, phase_ja: ph.ja, phasePortraitVerified: record?.verified === true, phasePortraitUrl: record?.url || null, variantKey };
  out.name_en = `${c.name_en || c.name} — ${ph.en}`;
  if (c.name_zh) out.name_zh = `${c.name_zh} · ${ph.zh}`;
  if (c.name_ja) out.name_ja = `${c.name_ja}・${ph.ja}`;
  return out;
}
export function characterPhaseVariants(c) {
  const opts = phaseOptionsFor(c); if (!opts?.length) return [c];
  const approved = opts.map(ph => withCharacterPhase(c, ph)).filter(x => x.phasePortraitVerified);
  return approved.length ? approved : [c];
}
export function applyCharacterPhases(chars) { return (chars || []).flatMap(characterPhaseVariants); }
export function characterIdentityCount(chars) { return new Set((chars || []).map(c => c.id)).size; }
/** Rebuild a drafted character (base or form) from a saved {id, phaseKey}. */
export function resolveCharacter(id, phaseKey) {
  const c = getCharacter(id); if (!c) return null;
  if (!phaseKey) return c;
  const ph = phaseOptionsFor(c)?.find(x => x.key === phaseKey);
  return ph ? withCharacterPhase(c, ph) : c;
}

/* ---- fusion pools ------------------------------------------------------ */
export function applyGenderFilter(chars) {
  let out = chars || [];
  if (STATE.genderFilter === "male") out = out.filter(c => c.gender === "male");
  else if (STATE.genderFilter === "female") out = out.filter(c => c.gender === "female");
  return applyCharacterPhases(out);
}
export function selectedPool(ids = STATE.selectedSeries) { return applyGenderFilter([...ids].flatMap(id => getSeries(id)?.chars || [])); }
export function excludedUnknownCount(ids = STATE.selectedSeries) {
  if (STATE.genderFilter === "all") return 0;
  return [...ids].flatMap(id => getSeries(id)?.chars || []).filter(c => !c.gender).length;
}

/* ---- PK --------------------------------------------------------------- */
/*
 * Budget PK prices come from the computer's ratings, so they stay consistent with how the
 * computer and the referee judge role fit:
 *   value = 0.7 × best fit for one of their series' five Budget roles + 0.3 × raw power (0–10)
 *           (role fit is what the referee judges first, but it also says raw power matters;
 *            without the power term a top healer outpriced Sukuna)
 *   price = their rank by value within their own series (Budget PK is played inside one series):
 *           top 7% $30 · next to 17% $25 · to 35% $20 · to 65% $15 · to 90% $10 · rest $5
 * Forms are priced on their own ratings. Edit a rating in attributes.js and the price follows;
 * PRICE_OVERRIDES in game.js pins a price by hand when a rating can't capture it.
 */
export const PRICE_BANDS = [[0.07, 30], [0.17, 25], [0.35, 20], [0.65, 15], [0.90, 10], [Infinity, 5]];
const SERIES_VALUES = new Map();
export function characterValue(c) {
  const roles = budgetRoleSet(c.seriesId);
  return 0.7 * Math.max(...roles.map(r => roleScore(c, r))) + 0.3 * attributes(c).power;
}
function seriesValues(seriesId) {
  const pool = pkCharacters(getSeries(seriesId)?.chars || []);
  const key = `${seriesId}:${pool.length}`;
  if (!SERIES_VALUES.has(key)) SERIES_VALUES.set(key, pool.map(characterValue));
  return SERIES_VALUES.get(key);
}
export function characterPrice(c) {
  if (!c) return 15;
  const pinned = PRICE_OVERRIDES[c.phaseKey ? `${c.id}:${c.phaseKey}` : c.id] ?? PRICE_OVERRIDES[c.id];
  if (pinned) return pinned;
  const values = seriesValues(c.seriesId); if (!values.length) return 15;
  const v = characterValue(c), above = values.filter(x => x > v + 1e-9).length;
  return PRICE_BANDS.find(([cut]) => above / values.length < cut)[1];
}
/** PK ignores the fusion gender filter (as in v0.6.x) but still uses verified forms. */
export function pkCharacters(chars) { return applyCharacterPhases(chars); }
export function roleSet(seriesId) { return ROLE_SETS[seriesId] || ["Leader", "Co-Leader", "Tanker", "Healer", "Strategist", "Traitor"]; }
export function budgetRoleSet(seriesId) { return roleSet(seriesId).filter(role => !/:traitor$/.test(role)).slice(0, 5); }
export function isTraitorRole(role) { return /:traitor$/.test(role); }
