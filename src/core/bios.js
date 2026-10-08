// One-line character bios, loaded per language the first time someone opens a character.
// ~120 KB per language, so they stay out of the boot download.
import { STATE, VERSION } from "./state.js";

const cache = {}, pending = {};
export function bioOf(c, l = STATE.lang) { return c ? cache[l]?.[c.id] ?? null : null; }
export function biosReady(l = STATE.lang) { return Boolean(cache[l]); }
export function loadBios(l = STATE.lang) {
  if (cache[l]) return Promise.resolve(cache[l]);
  return (pending[l] ||= fetch(`data/bios-${l}.json?v=${VERSION}`, { cache: "force-cache" })
    .then(r => { if (!r.ok) throw new Error("bios " + r.status); return r.json(); })
    .then(d => (cache[l] = d))
    .catch(e => { delete pending[l]; throw e; }));
}
/** for tests */
export function setBios(l, d) { cache[l] = d; }
