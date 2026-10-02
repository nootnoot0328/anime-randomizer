// Boot: load data, restore saved state, wire the shell, render.
import "./ui/views/home.js";
import "./ui/views/fusion.js";
import "./ui/views/pk.js";
import "./ui/views/battle.js";
import "./ui/views/library.js";
import "./ui/views/settings.js";
import { STATE, VERSION } from "./core/state.js";
import { app } from "./core/app.js";
import { t } from "./core/i18n.js";
import { setRoster } from "./core/roster.js";
import { loadHistory } from "./core/history.js";
import { openDB, purgeLegacyPackImages } from "./core/images.js";
import { restoreCustomizer } from "./game/fusion.js";
import { eligibleSeries } from "./game/pk.js";
import { aiConfigured, judge } from "./ai/referee.js";
import { wireEvents, render, toast } from "./ui/shell.js";
import { checkVersion } from "./ui/version.js";

// When a match ends the referee steps in on its own (if it's set up).
app.matchComplete = pk => { if (aiConfigured() && !pk.referee?.verdict) setTimeout(() => { if (STATE.pk === pk) judge(pk); }, 700); };

async function boot() {
  const screenEl = document.getElementById("screen");
  screenEl.innerHTML = `<div class="boot"><div class="boot-orb"></div><p>${t("loading")}</p></div>`;
  wireEvents();
  try {
    const get = f => fetch(`data/${f}?v=${VERSION}`, { cache: "no-cache" }).then(r => { if (!r.ok) throw new Error(f); return r.json(); });
    const [roster, portraits, forms] = await Promise.all([get("roster.json"), get("portraits.json"), get("form-portraits.json")]);
    setRoster(roster); STATE.portraits = portraits; STATE.formPortraits = forms;
    try { await openDB(); await purgeLegacyPackImages(); } catch (e) { console.warn("offline portraits unavailable", e); }
    loadHistory();
    restoreCustomizer();
    const list = eligibleSeries();
    STATE.pkSetup = { ...STATE.pkSetup, p1: list[0]?.id || null, p2: list[1]?.id || list[0]?.id || null, pool: list[0]?.id || null };
    STATE.ready = true;
    render();
    document.body.classList.add("ready");
    const v = await checkVersion();
    if (v.status === "update") { toast(t("updateAvailable"), "refresh"); document.getElementById("settingsBtn").classList.add("has-dot"); }
    if (STATE.screen === "settings") render();
  } catch (e) {
    console.error(e);
    screenEl.innerHTML = `<div class="empty"><p>${t("loadFailed")}</p><button class="btn primary" onclick="location.reload()">${t("tryAgain")}</button></div>`;
  }
}
boot();
