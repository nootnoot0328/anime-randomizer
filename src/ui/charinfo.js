// The character card: who this is, what they can do, and how the game rates them.
// Opened from the Gallery and from the little (i) on any card while picking.
import { STATE } from "../core/state.js";
import { t, displayName, displaySeries, roleLabel } from "../core/i18n.js";
import { attributes, bestRoles } from "../game/cpu.js";
import { getCharacter, getSeries, resolveCharacter, roleSet, characterPrice, phaseOptionsFor } from "../core/roster.js";
import { bioOf, biosReady, loadBios } from "../core/bios.js";
import { esc, icon, avatar } from "./parts.js";
import { actions, openSheet, sheetHead } from "./shell.js";

/** The (i) on a card. A span, so it can sit inside the card's own button without nesting buttons. */
export function infoDot(c) {
  if (!c) return "";
  return `<span class="info-dot" role="button" tabindex="0" aria-label="${esc(t("aboutCharacter", { name: displayName(c) }))}" data-act="char.info" data-v="${esc(`${c.id}|${c.phaseKey || ""}`)}">${icon("info")}</span>`;
}

function ratingsBlock(c) {
  const a = attributes(c), rows = [["power", "attrPower"], ["lead", "attrLead"], ["tank", "attrTank"], ["heal", "attrHeal"], ["intel", "attrIntel"]];
  const best = bestRoles(c, roleSet(c.seriesId)).slice(0, 2).map(r => roleLabel(r));
  return `<section class="ratings"><div class="ratings-head"><strong>${esc(t("cpuRatings"))}</strong><small>${esc(t("cpuRatingsNote"))}</small></div>
    ${rows.map(([k, label]) => `<div class="rating"><span>${esc(t(label))}</span><div class="meter thin"><i style="width:${a[k] * 10}%"></i></div><b class="mono">${a[k]}</b></div>`).join("")}
    <div class="best-roles"><small>${esc(t("bestRoles"))}</small>${best.map(r => `<span class="chip static">${esc(r)}</span>`).join("")}</div></section>`;
}
const bioBlock = c => {
  const b = bioOf(c);
  if (b) return `<p class="bio">${esc(b)}</p>`;
  return biosReady() ? "" : `<div class="bio skeleton" aria-hidden="true"><i></i><i></i></div>`;
};

export function openCharacterInfo(c) {
  if (!c) return;
  const forms = phaseOptionsFor(getCharacter(c.id)), price = characterPrice(c);
  const wrap = openSheet(`${sheetHead(displayName(c), displaySeries(getSeries(c.seriesId)))}
    <div class="char-sheet">
      <div class="char-top">${avatar(c, "av-portrait")}<div class="bio-slot">${bioBlock(c)}</div></div>
      ${ratingsBlock(c)}
      <dl><div><dt>English</dt><dd>${esc(c.name_en || "—")}</dd></div><div><dt>中文</dt><dd>${esc(c.name_zh || "—")}</dd></div><div><dt>日本語</dt><dd>${esc(c.name_ja || "—")}</dd></div>
      <div><dt>${esc(t("budgetPK"))}</dt><dd><span class="price t${price}">$${price}</span></dd></div>
      ${forms ? `<div><dt>${esc(t("characterPhases"))}</dt><dd>${forms.map(f => esc(f[STATE.lang] || f.en)).join(" · ")}</dd></div>` : ""}</dl>
    </div>`, { cls: "char-info" });
  if (!biosReady()) loadBios().then(() => {
    const slot = wrap.querySelector(".bio-slot"); if (slot && wrap.isConnected) slot.innerHTML = bioBlock(c);
  }).catch(() => { const slot = wrap.querySelector(".bio-slot"); if (slot) slot.innerHTML = ""; });
}

actions({
  "char.info": v => { const [id, ph] = String(v).split("|"); openCharacterInfo(resolveCharacter(id, ph || null)); },
});
