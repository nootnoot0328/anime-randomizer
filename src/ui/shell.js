// App shell: routing, rendering (morph within a screen, animated swap between screens),
// delegated actions, bottom sheets, toasts and haptics.
import { STATE } from "../core/state.js";
import { app } from "../core/app.js";
import { t } from "../core/i18n.js";
import { esc } from "../core/util.js";
import { morphHTML } from "./morph.js";
import { icon } from "./icons.js";

export const reducedMotion = () => globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ---- routes ------------------------------------------------------------ */
// tab: which bottom tab is lit; parent: where Back goes; game: full-screen, no tab bar
export const ROUTES = {
  home: { tab: "home" },
  library: { tab: "library" },
  history: { tab: "history" },
  serieslibrary: { tab: "library", parent: "library" },
  setup: { tab: "home", parent: "home" },
  draft: { tab: "home", parent: "home", game: true },
  quickreveal: { tab: "home", parent: "home", game: true },
  result: { tab: "home", parent: "home" },
  pksetup: { tab: "home", parent: "home" },
  pk: { tab: "home", parent: "home" },
  battle: { tab: "history", parent: "history" },
  settings: { tab: null, parent: null },
};
const VIEWS = {}, TITLES = {}, LEAVE = {}, ACTIONS = {}, INPUTS = {};
/** Register a screen: render(ctx) → html, title() → string, optional leave() when navigating away. */
export function screen(name, def) { VIEWS[name] = def.render; TITLES[name] = def.title; if (def.leave) LEAVE[name] = def.leave; if (def.hideTabs) ROUTES[name].hideTabs = def.hideTabs; }
export function actions(map) { Object.assign(ACTIONS, map); }
export function inputs(map) { Object.assign(INPUTS, map); }

const scrollMemory = {};
let lastScreen = null, pendingDir = "tab";

export function go(name, opts = {}) {
  if (!ROUTES[name]) name = "home";
  const from = STATE.screen;
  if (from !== name) {
    scrollMemory[from] = window.scrollY;
    LEAVE[from]?.(name);
    if (name === "settings") STATE.settingsReturn = from === "settings" ? STATE.settingsReturn : from;
    STATE.settingsSection = opts.section || null;
  }
  pendingDir = opts.dir || (ROUTES[name].parent === from || name === "settings" ? "forward" : ROUTES[from]?.parent === name ? "back" : opts.replace ? "fade" : (ROUTES[name].tab !== ROUTES[from]?.tab || !ROUTES[name].parent) ? "tab" : "forward");
  STATE.screen = name;
  closeSheet(true);
  render();
  const restore = pendingDir === "back" || pendingDir === "tab" ? scrollMemory[name] || 0 : 0;
  window.scrollTo({ top: pendingDir === "tab" && !ROUTES[name].parent ? restore : pendingDir === "back" ? restore : 0, behavior: "instant" });
}
export function back() {
  const r = ROUTES[STATE.screen];
  const target = STATE.screen === "settings" ? (STATE.settingsReturn || "home") : r?.parent || "home";
  go(target, { dir: "back" });
}

/* ---- render ------------------------------------------------------------ */
export function render() {
  if (!STATE.ready) return;
  const el = document.getElementById("screen"), name = STATE.screen, view = VIEWS[name] || VIEWS.home;
  const first = lastScreen !== name;
  const html = view({ first });
  if (first) {
    el.innerHTML = html;
    el.dataset.screen = name;
    animateIn(el, pendingDir);
    lastScreen = name;
  } else morphHTML(el, html);
  // chrome
  const route = ROUTES[name] || {};
  const backBtn = document.getElementById("backBtn");
  backBtn.classList.toggle("is-hidden", !route.parent && name !== "settings");
  const title = document.getElementById("topTitle"), text = (TITLES[name] || (() => ""))();
  if (title.dataset.text !== text) { title.dataset.text = text; title.innerHTML = text ? `<span class="tt">${esc(text)}</span>` : `<span class="brand"><i class="brand-dot"></i>ANIME FUSION</span>`; }
  document.getElementById("settingsBtn").classList.toggle("is-hidden", name === "settings");
  const hideTabs = route.game || (typeof route.hideTabs === "function" ? route.hideTabs() : false);
  document.body.classList.toggle("no-tabs", Boolean(hideTabs));
  document.querySelectorAll(".tab").forEach(b => { const on = b.dataset.tab === route.tab; b.classList.toggle("on", on); b.setAttribute("aria-current", on ? "page" : "false"); });
  document.querySelectorAll("[data-i18n]").forEach(n => { const s = t(n.dataset.i18n); if (n.textContent !== s) n.textContent = s; });
  document.documentElement.lang = STATE.lang === "zh" ? "zh-Hans" : STATE.lang;
  backBtn.setAttribute("aria-label", t("back")); document.getElementById("settingsBtn").setAttribute("aria-label", t("settings"));
}
function animateIn(el, dir) {
  if (reducedMotion() || !el.animate) return;
  const frames = {
    forward: [{ opacity: 0, transform: "translateX(28px)" }, { opacity: 1, transform: "none" }],
    back: [{ opacity: 0, transform: "translateX(-28px)" }, { opacity: 1, transform: "none" }],
    tab: [{ opacity: 0, transform: "translateY(10px) scale(.985)" }, { opacity: 1, transform: "none" }],
    fade: [{ opacity: 0, transform: "scale(.97)" }, { opacity: 1, transform: "none" }],
  }[dir] || [{ opacity: 0 }, { opacity: 1 }];
  el.animate(frames, { duration: dir === "fade" ? 420 : 300, easing: "cubic-bezier(.2,.8,.2,1)" });
}

/* ---- delegated events --------------------------------------------------- */
export function wireEvents() {
  // image errors don't bubble, so listen in the capture phase
  document.addEventListener("error", e => { const src = e.target?.dataset?.imgSrc; if (src) import("../core/images.js").then(m => m.markImageFailed(src)); }, true);
  document.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el || el.disabled || el.getAttribute("aria-disabled") === "true") return;
    const fn = ACTIONS[el.dataset.act]; if (!fn) return console.warn("no action", el.dataset.act);
    e.preventDefault();
    fn(el.dataset.v, el, e);
  });
  const onInput = e => { const el = e.target.closest("[data-input]"); if (!el) return; INPUTS[el.dataset.input]?.(el.value, el, e); };
  document.addEventListener("input", onInput);
  document.addEventListener("change", e => { if (e.target.matches("select[data-input]")) onInput(e); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && document.querySelector(".sheet-wrap.open")) closeSheet();
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-act]:not(button)")) { e.preventDefault(); e.target.click(); }
  });
  document.getElementById("backBtn").onclick = () => back();
  document.getElementById("settingsBtn").onclick = () => go("settings");
  document.querySelectorAll(".tab").forEach(b => b.onclick = () => { if (STATE.screen === b.dataset.tab) window.scrollTo({ top: 0, behavior: reducedMotion() ? "instant" : "smooth" }); else go(b.dataset.tab, { dir: "tab" }); });
}

/* ---- bottom sheets ----------------------------------------------------- */
let sheetClose = null;
export function openSheet(html, { onClose, cls = "" } = {}) {
  const root = document.getElementById("sheetRoot");
  closeSheet(true);
  root.innerHTML = `<div class="sheet-wrap ${cls}" role="dialog" aria-modal="true"><div class="sheet-scrim" data-sheet-close></div><div class="sheet"><div class="sheet-grip" aria-hidden="true"></div>${html}</div></div>`;
  const wrap = root.firstElementChild;
  wrap.querySelectorAll("[data-sheet-close]").forEach(n => n.addEventListener("click", () => closeSheet()));
  sheetClose = onClose || null;
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add("open")));
  document.body.classList.add("sheet-open");
  enableSwipeToClose(wrap.querySelector(".sheet"));
  wrap.querySelector("[autofocus]")?.focus();
  return wrap;
}
export function closeSheet(instant = false) {
  const wrap = document.querySelector("#sheetRoot .sheet-wrap"); if (!wrap) return;
  const cb = sheetClose; sheetClose = null;
  document.body.classList.remove("sheet-open");
  if (instant || reducedMotion()) wrap.remove();
  else { wrap.classList.remove("open"); wrap.classList.add("closing"); setTimeout(() => wrap.remove(), 280); }
  cb?.();
}
export function sheetOpen() { return Boolean(document.querySelector("#sheetRoot .sheet-wrap.open")); }
function enableSwipeToClose(sheet) {
  let y0 = null, dy = 0;
  sheet.addEventListener("pointerdown", e => { if (!e.target.closest(".sheet-grip, .sheet-head") || e.button > 0) return; y0 = e.clientY; dy = 0; sheet.setPointerCapture(e.pointerId); sheet.style.transition = "none"; });
  sheet.addEventListener("pointermove", e => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = `translateY(${dy}px)`; });
  const end = () => { if (y0 === null) return; y0 = null; sheet.style.transition = ""; sheet.style.transform = ""; if (dy > 90) closeSheet(); };
  sheet.addEventListener("pointerup", end); sheet.addEventListener("pointercancel", end);
}
export function sheetHead(title, sub = "") {
  return `<div class="sheet-head"><div><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div><button class="icon-btn" data-sheet-close aria-label="${esc(t("close"))}">${icon("x")}</button></div>`;
}
export function confirmSheet({ title, body = "", ok, cancel = t("cancel"), danger = false }) {
  return new Promise(resolve => {
    let answered = false;
    const wrap = openSheet(`${sheetHead(title)}${body ? `<p class="sheet-body">${esc(body)}</p>` : ""}<div class="sheet-actions"><button class="btn ghost" data-confirm="0">${esc(cancel)}</button><button class="btn ${danger ? "danger" : "primary"}" data-confirm="1">${esc(ok)}</button></div>`, { onClose: () => { if (!answered) resolve(false); } });
    wrap.querySelectorAll("[data-confirm]").forEach(b => b.addEventListener("click", () => { answered = true; resolve(b.dataset.confirm === "1"); closeSheet(); }));
  });
}
/** Copy to clipboard, or show the text in a sheet where it can be selected by hand. */
export async function copyText(text, title, doneMsg) {
  try { await navigator.clipboard.writeText(text); toast(doneMsg || t("copyDone"), "check"); haptic("light"); }
  catch {
    const wrap = openSheet(`${sheetHead(title)}<textarea class="copy-area" readonly>${esc(text)}</textarea><div class="sheet-actions"><button class="btn primary" data-sheet-close>${esc(t("done"))}</button></div>`);
    const ta = wrap.querySelector("textarea"); ta.focus(); ta.select();
  }
}

/* ---- toast / haptics ---------------------------------------------------- */
let toastTimer = null;
export function toast(msg, ic = "info") {
  const el = document.getElementById("toast"); if (!el) return;
  el.innerHTML = `${icon(ic)}<span>${esc(msg)}</span>`;
  el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}
export function haptic(kind = "light") {
  try { navigator.vibrate?.(kind === "success" ? [12, 40, 18] : kind === "heavy" ? 30 : 8); } catch { }
}

Object.assign(app, { render, go, toast: (m) => toast(m), haptic });
