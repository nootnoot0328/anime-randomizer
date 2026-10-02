// Roster, pools, character forms (phases), prices and PK role sets.
// Pure functions over STATE; no DOM.
import { CHARACTER_PHASES, PRICE_TIERS, ROLE_SETS } from "../data/game.js";
import { STATE } from "./state.js";

const PRICE_BY_ID = new Map();
for (const [price, ids] of Object.entries(PRICE_TIERS)) ids.forEach(id => PRICE_BY_ID.set(id, Number(price)));

export function setRoster(roster) {
  STATE.builtin = roster.map(s => ({
    ...s, name: s.name_en,
    chars: (s.chars || []).map(c => ({ ...c, name: c.name_en, series: s.name_en, series_en: s.name_en, series_ja: s.name_ja, series_zh: s.name_zh, seriesId: s.id })),
  }));
  CHAR_INDEX = null;
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
export function characterPrice(c) { return PRICE_BY_ID.get(c?.id) ?? 15; }
/** PK ignores the fusion gender filter (as in v0.6.x) but still uses verified forms. */
export function pkCharacters(chars) { return applyCharacterPhases(chars); }
export function roleSet(seriesId) { return ROLE_SETS[seriesId] || ["Leader", "Co-Leader", "Tanker", "Healer", "Strategist", "Traitor"]; }
export function budgetRoleSet(seriesId) { return roleSet(seriesId).filter(role => !/:traitor$/.test(role)).slice(0, 5); }
export function isTraitorRole(role) { return /:traitor$/.test(role); }
