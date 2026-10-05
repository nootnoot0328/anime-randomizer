# Anime Fusion v1.3.0

A static anime character game for phones, hosted on GitHub Pages. No build step, no runtime dependencies.

- **Character fusion:** Trait Draft (pick one of two, choose which trait to inherit) and Quick Randomizer, across 10 scenarios. Copies an image-generator prompt for the finished character.
- **Team battles:** Random PK (six roles, one skip each) and $100 Budget PK (five roles, one sale, may finish early), local 2-player or vs a Casual/Strategic computer.
- **AI referee:** judges finished battles and adds live commentary through your own Cloudflare Worker (optional; the copy-paste judge prompt still works without it).
- **AI character sheets:** "Bring them to life" turns a finished fusion into a named character with a backstory, dialogue and a signature move (same Worker, optional).
- English, Simplified Chinese and Japanese.

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Code layout

```text
index.html            shell + import map (generated, see "Releasing")
styles.css            all styles; motion respects prefers-reduced-motion
logic.js              small pure helpers shared with tests (version compare, shuffle, PK pool rules)
src/main.js           boot: load data, restore state, render
src/core/             state, i18n, roster/forms/prices, history, portraits, prompt builders
src/game/             fusion.js (draft + quick), pk.js (random + budget), cpu.js (computer opponent)
src/ai/               referee.js (Worker client), format.js (answer contract + parser),
                      sheet.js + sheet-format.js (character sheet prompt, parser, saving)
src/ui/               shell (routing, sheets, toasts), morph (in-place DOM updates), views/*
src/data/             game data, character ratings (attributes.js) and strings (strings.js = v0.6 set, strings-v1.js = added in v1)
data/                 roster, portrait manifests
tests/                node --test suites; fixtures/prompts-v0.6.4.json pins every prompt
```

Screens re-render by **morphing** the existing DOM rather than replacing it, so transitions run on state changes, entrance animations play once, and inputs keep focus.

## AI referee

GitHub Pages can't keep a secret, so the game never holds an AI provider key. It calls the Setpoint Worker (`nootnoot0328/setpoints`, Worker 1.4.0+, 1.5.0+ for character sheets) with a separate **`GAME_KEY`** that can only request match verdicts and character sheets (text only, its own daily cap, `GAME_AI_DAILY_LIMIT`, default 40). It cannot read Setpoint data. Setup steps are in `setpoints/worker/README.md`. In the game: **Settings → AI referee**, paste the Worker address and the game key, tap **Test & save**. The test spends no AI call, and it refuses to save Setpoint's `APP_KEY`.

How a verdict is produced:

1. The prompt is the same role-first judging framework as the copy-paste judge prompt. Only the answer format is swapped for JSON (`src/ai/format.js`).
2. The reply is validated: winner must be 1, 2 or 0 (draw). A draw is always margin "even", and a win never is. The MVP must be one of the drafted characters. Anything unreadable is rejected and nothing is saved.
3. A valid verdict is stored with the match in History and shown from then on. **It is final**: there is no re-judge button, so a result can't be re-rolled until someone likes it. A failed call can be retried.

The verdict is still an AI opinion, and the same teams can get a different answer from a fresh call. Storing the first valid verdict is what makes each match's result stable.

Character sheets work differently: they're creative rather than a result, so each character allows **one rewrite** (a failed rewrite keeps the current sheet and isn't counted). Sheets share the game key's daily limit with the referee.

## Portrait workflow

Runtime fuzzy matching was removed in v0.5. Built-in portrait URLs are generated ahead of time:

1. `data/roster.json` contains the built-in roster, stable character IDs, translations, gender, and each series' `anilistSearch` titles.
2. `scripts/resolve-portraits.mjs` resolves those series and characters through AniList using Node 20's built-in `fetch`.
3. The script writes URL/ID metadata only to `data/portraits.json`.
4. The GitHub workflow runs automatically when the roster or overrides change, or manually through **Actions → Resolve portraits → Run workflow**.
5. The browser loads `roster.json` and `portraits.json` before its first render. No AniList API call is made while playing.

### Portrait overrides

`data/portrait-overrides.json` is hand-maintained and keyed by stable character ID:

```json
{
  "dragonball-vegeta": { "anilistCharacterId": 123 },
  "example-character": { "url": "https://example.com/portrait.jpg" },
  "character-to-skip": { "skip": true }
}
```

Overrides are applied before fuzzy matching. The resolver prints unmatched characters and scores below 70 for review.

**Never commit portrait image files to this repository.** Only URLs and AniList IDs belong in the generated portrait manifest/overrides.

## Optional offline built-in portraits

Built-in cards use the URLs in `data/portraits.json` immediately. Settings → Portraits can optionally fetch those URLs and store Blob copies under `builtin:<charId>` in IndexedDB. If CORS prevents a Blob download, the app continues to use the remote URL.

## Computer opponent

`src/game/cpu.js` scores every (character, role) pair from the ratings in `src/data/attributes.js`, weighting power against the skill the role needs, the way the AI referee judges role execution. The traitor slot is scored inversely: the weaker the traitor, the less they hurt their own team. Ratings are judgement calls. To change how the computer sees someone, edit their line; the Gallery card shows the result.

## Tests

```bash
npm test
```

- `tests/prompts.test.mjs`: every fusion, judge and battle-art prompt matches what v0.6.4 produced for 66 captured games (3 languages, random + budget).
- `tests/game.test.mjs`: draft/budget/CPU rules, referee answer parsing, history, data and string completeness.
- `tests/sheet.test.mjs`: character sheet prompt contract and parser.
- `tests/cpu.test.mjs`: rating coverage and range, canon sanity checks (healers, strategists), and computer decisions, including a seeded simulation against the v1.0.0 behaviour.
- `tests/logic.test.mjs`: helpers, roster data and version/import-map consistency.

## Releasing

```bash
node scripts/set-version.mjs 1.0.1   # updates version.json, package.json, VERSION and the import map
npm test
```

Every module URL carries `?v=<version>` through the import map, so a phone never mixes cached old modules with new ones after an update.
