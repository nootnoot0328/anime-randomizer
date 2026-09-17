# Anime Fusion v0.5.0

Anime Fusion is a static vanilla HTML/CSS/JS character draft/randomizer designed for GitHub Pages. It has no backend, no runtime npm dependencies, and no API keys in the browser.

## Run locally

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## GitHub Pages deployment

Commit the complete repository structure:

```text
index.html
styles.css
app.js
logic.js
version.json
data/
  roster.json
  portraits.json
  portrait-overrides.json
scripts/
  resolve-portraits.mjs
.github/workflows/
  resolve-portraits.yml
  test.yml
tests/
  logic.test.mjs
package.json
CHANGELOG.md
README.md
```

Then enable **Settings → Pages → Deploy from a branch → main → / (root)**.

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

## Private packs and Safari storage

Private pack images are resized and stored as Blobs in IndexedDB. v0.5 upgrades the database to version 2 and migrates existing v0.4.1 inline data URLs non-destructively.

Safari/iOS can clear website storage under storage pressure. Anime Fusion requests persistent storage when the first pack is created, but persistence is not guaranteed on every browser. Export your private packs regularly. If no export has been recorded for 14 days, the Packs screen displays a backup reminder.

`.fusionpack` exports remain self-contained and backward compatible with v0.4.1 using:

```json
{ "format": "animefusion-pack-v1", "pack": { "name": "...", "chars": [] } }
```

## Optional offline built-in portraits

Built-in cards use the URLs in `data/portraits.json` immediately. The Character Library/Settings can optionally fetch those URLs and store Blob copies under `builtin:<charId>` in IndexedDB. If CORS prevents a Blob download, the app continues to use the remote URL.

## Development tests

```bash
npm test
```

The project intentionally has no runtime npm dependencies. Node is used only for tests and portrait-resolution tooling.
