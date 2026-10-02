// Small shared view pieces. All return HTML strings; actions are wired by data-act.
import { esc } from "../core/util.js";
import { displayName, initials } from "../core/i18n.js";
import { characterImageUrl } from "../core/images.js";
import { icon } from "./icons.js";

export { esc, icon };

/** Stable pleasant hue per character for initials placeholders. */
function hue(id = "") { let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; }

export function avatar(c, cls = "") {
  const url = characterImageUrl(c), name = displayName(c);
  if (url) return `<span class="av ${cls}"><img src="${esc(url)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-img-src="${esc(url)}"></span>`;
  return `<span class="av av-fallback ${cls}" style="--h:${hue(c?.id)}"><b>${esc(initials(name))}</b></span>`;
}
export function act(name, v) { return `data-act="${esc(name)}"${v !== undefined ? ` data-v="${esc(String(v))}"` : ""}`; }

export function seg(options, value, actName, cls = "") {
  return `<div class="seg ${cls}" role="radiogroup" style="--n:${options.length};--i:${Math.max(0, options.findIndex(o => o.v === value))}"><span class="seg-thumb" aria-hidden="true"></span>${options.map(o => `<button type="button" role="radio" aria-checked="${o.v === value}" class="seg-opt${o.v === value ? " on" : ""}" ${act(actName, o.v)}>${o.icon ? icon(o.icon) : ""}<span>${esc(o.label)}</span></button>`).join("")}</div>`;
}
export function chip(label, on, actName, v, extra = "") {
  return `<button type="button" class="chip${on ? " on" : ""}" aria-pressed="${on}" ${act(actName, v)} ${extra}>${on ? icon("check", "chip-check") : ""}<span>${esc(label)}</span></button>`;
}
export function sectionHead(title, aside = "", sub = "") {
  return `<div class="sec-head"><div><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div>${aside}</div>`;
}
export function emptyState(ic, text, extra = "") {
  return `<div class="empty">${icon(ic)}<p>${esc(text)}</p>${extra}</div>`;
}
