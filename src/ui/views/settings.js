import { STATE, VERSION, KEYS } from "../../core/state.js";
import { t, displaySeries } from "../../core/i18n.js";
import { allSeries } from "../../core/roster.js";
import { esc, icon, act, seg } from "../parts.js";
import { screen, actions, inputs, render, openSheet, sheetHead, closeSheet, confirmSheet, toast } from "../shell.js";
import { aiConfigured, saveAIConfig, clearAIConfig, testConnection } from "../../ai/referee.js";
import { savePortraitsOffline, resetBuiltinPortraits, refreshStorageEstimate, offlineCount } from "../../core/images.js";

let offlineSaved = null;
function storageBlock() {
  const usage = STATE.storageInfo?.usage || 0, quota = STATE.storageInfo?.quota || 0, pct = quota ? Math.min(100, (usage / quota) * 100) : 0;
  return STATE.storageInfo ? `<div class="meter-row"><span>${esc(t("storageUsage"))}</span><span class="mono">${(usage / 1048576).toFixed(1)} / ${(quota / 1048576).toFixed(0)} MB</span></div><div class="meter thin"><i style="width:${pct}%"></i></div>` : "";
}
// typed-but-unsaved values live here so a re-render never wipes them
const draft = { url: null, key: null, reveal: false };
function aiBlock() {
  const tst = STATE.aiTest, on = aiConfigured(), url = draft.url ?? STATE.ai.url, key = draft.key ?? STATE.ai.key;
  const status = tst?.pending ? `<div class="status pending"><span class="spinner"></span>${esc(t("testing"))}</div>`
    : tst ? `<div class="status ${tst.ok ? "ok" : "bad"}">${icon(tst.ok ? "check" : "info")}<span>${esc(t("aiTest_" + tst.code, { v: tst.detail || "" }))}</span></div>`
    : on ? `<div class="status ok">${icon("check")}<span>${esc(t("aiConnected"))}</span></div>` : "";
  return `<section class="card" id="ai" data-key="ai">
    <div class="sec-head"><div><h2>${icon("whistle")} ${esc(t("aiReferee"))}</h2><p>${esc(t("aiRefereeExplain"))}</p></div><span class="pill ${on ? "on" : ""}">${esc(t(on ? "on" : "off"))}</span></div>
    <label class="field-label" for="aiUrl">${esc(t("workerUrl"))}</label>
    <input class="input" id="aiUrl" type="url" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="https://setpoint-sync.<you>.workers.dev" value="${esc(url)}" data-input="settings.url">
    <label class="field-label" for="aiKey">${esc(t("gameKey"))}</label>
    <div class="input-row"><input class="input" id="aiKey" type="${draft.reveal ? "text" : "password"}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="GAME_KEY" value="${esc(key)}" data-input="settings.key"><button class="icon-btn" ${act("settings.reveal")} aria-label="${esc(t("show"))}">${icon("search")}</button></div>
    <p class="hint">${esc(t("gameKeyHint"))}</p>
    ${status}
    <div class="row-actions"><button class="btn primary" ${act("settings.aiSave")} ${tst?.pending ? 'aria-disabled="true"' : ""}>${icon("wifi")}<span>${esc(t("testAndSave"))}</span></button>${on ? `<button class="btn ghost" ${act("settings.aiClear")}>${esc(t("disconnect"))}</button>` : ""}</div>
    <details class="explain"><summary>${esc(t("aiPrivacyTitle"))}</summary><p>${esc(t("aiPrivacyBody"))}</p></details>
  </section>`;
}
screen("settings", {
  title: () => t("settings"),
  render: ({ first }) => {
    const v = STATE.versionInfo, forms = Object.values(STATE.formPortraits?.variants || {}), verified = forms.filter(x => x.verified === true).length;
    if (first) {
      refreshStorageEstimate().then(render); offlineCount().then(n => { offlineSaved = n; render(); });
      if (STATE.settingsSection) requestAnimationFrame(() => document.getElementById(STATE.settingsSection)?.scrollIntoView({ block: "start", behavior: "smooth" }));
    }
    return `<div class="settings${first ? " stagger" : ""}">
      <section class="card" data-key="lang"><div class="sec-head"><div><h2>${icon("globe")} ${esc(t("language"))}</h2></div></div>
        ${seg([{ v: "en", label: "English" }, { v: "zh", label: "简体中文" }, { v: "ja", label: "日本語" }], STATE.lang, "settings.lang")}</section>
      ${aiBlock()}
      <section class="card" data-key="portraits"><div class="sec-head"><div><h2>${icon("image")} ${esc(t("portraits"))}</h2><p>${esc(t("settingsAniListNote"))}</p></div></div>
        <div class="meter-row"><span>${esc(t("savedOnDevice"))}</span><span class="mono">${offlineSaved ?? "…"}</span></div>
        ${storageBlock()}
        <div class="row-actions"><button class="btn secondary" ${act("settings.offline")}>${icon("download")}<span>${esc(t("saveOffline"))}</span></button><button class="btn ghost" ${act("settings.reset")}>${esc(t("resetOffline"))}</button></div>
        <details class="explain"><summary>${esc(t("formPortraits"))} · ${verified} ${esc(t("verified"))}${forms.length - verified ? ` · ${forms.length - verified} ${esc(t("pending"))}` : ""}</summary><p>${esc(t("formPortraitsDesc"))}</p></details>
      </section>
      <section class="card" data-key="about"><div class="sec-head"><div><h2>${icon("info")} ${esc(t("version"))}</h2></div><span class="pill">v${esc(VERSION)}</span></div>
        <div class="meter-row"><span>${esc(t("latestVersion"))}</span><span class="mono">${esc(v.latest || "—")}</span></div>
        <div class="meter-row"><span>${esc(t("status"))}</span><strong>${esc(v.status === "update" ? t("updateAvailable") : v.status === "ok" ? t("upToDate") : t("unknown"))}</strong></div>
        ${v.status === "update" ? `<div class="row-actions"><button class="btn primary" ${act("settings.refresh")}>${icon("refresh")}<span>${esc(t("refreshApp"))}</span></button></div>` : ""}
      </section>
    </div>`;
  },
});

function openOfflineSheet() {
  const wrap = openSheet(`${sheetHead(t("saveOffline"), t("storageNote"))}
    <div class="check-list">${allSeries().map(s => `<label class="check-row"><input type="checkbox" class="offline-series" value="${esc(s.id)}" checked><span>${esc(displaySeries(s))}</span><small>${s.chars.length}</small></label>`).join("")}</div>
    <div class="offline-progress" hidden><div class="meter-row"><span>${esc(t("savingOffline"))}</span><span class="mono op-count"></span></div><div class="meter"><i class="op-bar" style="width:0%"></i></div>
    <div class="op-stats"><div><strong class="op-saved">0</strong><span>${esc(t("savedLocal"))}</span></div><div><strong class="op-remote">0</strong><span>${esc(t("usingRemote"))}</span></div><div><strong class="op-failed">0</strong><span>${esc(t("failed"))}</span></div></div></div>
    <div class="sheet-actions"><button class="btn primary op-go">${icon("download")}<span>${esc(t("saveOffline"))}</span></button></div>`);
  wrap.querySelector(".op-go").addEventListener("click", async e => {
    const btn = e.currentTarget; btn.disabled = true;
    const ids = [...wrap.querySelectorAll(".offline-series:checked")].map(x => x.value), chars = ids.flatMap(id => allSeries().find(s => s.id === id)?.chars || []);
    wrap.querySelector(".offline-progress").hidden = false;
    const q = sel => wrap.querySelector(sel);
    await savePortraitsOffline(chars, s => { q(".op-saved").textContent = s.saved; q(".op-remote").textContent = s.remote; q(".op-failed").textContent = s.failed; q(".op-count").textContent = `${s.done}/${s.total}`; q(".op-bar").style.width = `${s.total ? (s.done / s.total) * 100 : 100}%`; });
    offlineSaved = await offlineCount(); await refreshStorageEstimate(); closeSheet(); render();
  });
}

actions({
  "settings.lang": v => { STATE.lang = ["en", "zh", "ja"].includes(v) ? v : "en"; try { localStorage.setItem(KEYS.lang, STATE.lang); } catch { } render(); },
  "settings.reveal": () => { draft.reveal = !draft.reveal; render(); },
  "settings.aiSave": async () => {
    const url = draft.url ?? STATE.ai.url, key = draft.key ?? STATE.ai.key;
    STATE.aiTest = { pending: true }; render();
    const r = await testConnection(url, key);
    STATE.aiTest = r;
    if (r.ok) { saveAIConfig(url, key); draft.url = draft.key = null; toast(t("aiConnected"), "check"); }
    // never keep the Setpoint APP_KEY around in the game
    else if (r.code === "isAppKey") draft.key = "";
    render();
  },
  "settings.aiClear": async () => { if (await confirmSheet({ title: t("disconnect"), body: t("disconnectBody"), ok: t("disconnect"), danger: true })) { clearAIConfig(); draft.url = draft.key = null; render(); } },
  "settings.offline": () => openOfflineSheet(),
  "settings.reset": async () => { if (await confirmSheet({ title: t("resetOffline"), ok: t("resetOffline"), danger: true })) { await resetBuiltinPortraits(); offlineSaved = await offlineCount(); toast(t("imageCacheCleared"), "check"); render(); } },
  "settings.refresh": () => { if (STATE.versionInfo.latest) location.replace(`${location.pathname}?v=${encodeURIComponent(STATE.versionInfo.latest)}`); },
});
inputs({
  "settings.url": v => { draft.url = v; if (STATE.aiTest && !STATE.aiTest.pending) STATE.aiTest = null; },
  "settings.key": v => { draft.key = v; if (STATE.aiTest && !STATE.aiTest.pending) STATE.aiTest = null; },
});
