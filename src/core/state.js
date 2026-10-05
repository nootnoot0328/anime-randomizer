// The single mutable app state. Storage keys are the same as v0.6.x so existing
// players keep their language, history, customizer and form choices.
import { readJSON } from "./util.js";

export const VERSION = "1.2.0";

export const KEYS = {
  lang: "af_lang",
  history: "af_history",
  customizer: "af_customizer_v1",
  phases: "af_character_phases_v1",
  ai: "af_ai_v1",
};

function storedLang() {
  try { return globalThis.localStorage?.getItem(KEYS.lang) || "en"; } catch { return "en"; }
}

export const STATE = {
  lang: storedLang(),
  ready: false,
  screen: "home",
  // data
  builtin: [], portraits: { generatedAt: null, series: {}, chars: {} }, formPortraits: { variants: {} },
  history: [],
  // fusion customizer
  setupKind: "standard", selectedSeries: new Set(), selectedMode: "partner", selectedTraits: new Set(),
  genderFilter: "all", poolMode: "repeat",
  // games
  game: null, quickReveal: null, quickRunId: 0, resultSaved: false,
  pk: null, pkSetup: { kind: "random", p1: null, p2: null, pool: null, opponent: "local", difficulty: "strategic" },
  // screens
  librarySeriesId: null, gallerySearch: "", historyFilter: "all", historyOpen: null, settingsReturn: "home",
  versionInfo: { current: VERSION, latest: null, status: "unknown" }, storageInfo: null,
  // AI referee connection (device-local)
  ai: readJSON(KEYS.ai, { url: "", key: "" }) || { url: "", key: "" },
  aiTest: null,
};
