# Anime Fusion Web MVP

Static HTML/CSS/JS version of the Anime Fusion prototype.

## Features

- Standard two-card trait draft
- Quick randomizer
- Two-player PK team draft
- English / Simplified Chinese / Japanese
- Built-in demo anime rosters
- Automatic character portrait lookup for built-in rosters via Jikan/MyAnimeList
- Private local character packs
- Bulk image import
- Bulk name assignment
- `.fusionpack` import/export
- Result history
- Copy-ready AI image generator prompt
- No server required

## Run locally

Just open `index.html` in a browser.

For the most reliable behavior, run a tiny local server:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

## GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html`, `styles.css`, and `app.js` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select your `main` branch and `/ (root)`.
6. Save.
7. GitHub will provide the public Pages URL.

## Private pack storage

Private packs and imported images are stored in the browser using IndexedDB.

That means:

- GitHub never receives the user's imported images.
- Packs remain on that browser/device unless exported.
- Clearing site data may delete local packs.
- Use **Export** to back up a pack as a `.fusionpack` file.

## Adding more built-in demo series

Edit the `BUILTIN` constant near the top of `app.js`.

## Image generation

This MVP intentionally does not call any AI API.

After completing a character, press **Copy Image Prompt** and paste the generated prompt into your preferred image generator.

A later version can connect this button to an API/backend.

## Notes

Because this is a static GitHub Pages app, secret API keys should **not** be placed directly in `app.js`. Use a backend/serverless function if AI generation is later automated.


## Built-in character portraits

The built-in demo roster now automatically looks up character portrait URLs from the public Jikan API (which exposes MyAnimeList character data).

- Images are fetched only as needed.
- The resolved image URLs are cached in `localStorage`.
- Private pack images continue to live locally in IndexedDB.
- If a portrait is wrong or stale, use **Settings → Refresh character images**.
- The first load of a series can take a few seconds because requests are deliberately throttled.

This is best suited to a personal/non-commercial prototype. If you later publish the app publicly, review the image provider's current terms and the rights status of third-party character artwork.
