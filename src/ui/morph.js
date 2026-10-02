// Minimal DOM morphing. Re-rendering a screen updates the nodes that are already there
// instead of replacing them, so CSS transitions run on state changes, entrance animations
// play once (only on genuinely new nodes), images don't reload mid-shuffle, and focused
// inputs keep their caret. Elements with data-key are matched by key (lists that reorder).

const keyOf = n => (n.nodeType === 1 ? n.getAttribute("data-key") : null);
const compatible = (a, b) => a.nodeType === b.nodeType && (a.nodeType !== 1 || (a.tagName === b.tagName && a.id === b.id && keyOf(a) === keyOf(b)));

function syncAttrs(a, b) {
  for (const { name } of [...a.attributes]) if (!b.hasAttribute(name)) a.removeAttribute(name);
  for (const { name, value } of [...b.attributes]) if (a.getAttribute(name) !== value) a.setAttribute(name, value);
}
function syncFormState(a, b) {
  const focused = a === document.activeElement;
  if ((a.tagName === "INPUT" || a.tagName === "TEXTAREA") && !focused) {
    const v = b.getAttribute("value") ?? (a.tagName === "TEXTAREA" ? b.textContent : "");
    if (a.type === "checkbox" || a.type === "radio") a.checked = b.hasAttribute("checked");
    else if (a.value !== v) a.value = v;
  }
  if (a.tagName === "SELECT" && !focused) {
    const sel = [...b.options].find(o => o.hasAttribute("selected"));
    if (sel && a.value !== sel.value) queueMicrotask(() => { a.value = sel.value; });
  }
}
function morphNode(a, b) {
  if (a.nodeType === 3 || a.nodeType === 8) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
  syncAttrs(a, b);
  syncFormState(a, b);
  if (a.hasAttribute("data-morph-skip")) return;
  morphChildren(a, b);
}
export function morphChildren(from, to) {
  const keyed = new Map();
  for (const n of from.childNodes) { const k = keyOf(n); if (k != null) keyed.set(k, n); }
  let cur = from.firstChild;
  for (const nb of [...to.childNodes]) {
    const k = keyOf(nb);
    let m = null;
    if (k != null) { m = keyed.get(k) || null; if (m && m.tagName !== nb.tagName) m = null; if (m) keyed.delete(k); }
    else if (cur && keyOf(cur) == null && compatible(cur, nb)) m = cur;
    if (m) {
      if (m !== cur) from.insertBefore(m, cur);
      else cur = cur.nextSibling;
      morphNode(m, nb);
    } else {
      from.insertBefore(nb, cur);
    }
  }
  while (cur) { const next = cur.nextSibling; from.removeChild(cur); cur = next; }
}
/** Morph `el`'s children to match an HTML string. */
export function morphHTML(el, html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  morphChildren(el, tpl.content);
}
