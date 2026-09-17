# Changelog

## v0.5.1 — Visual PK teams and expanded roster

### PK
- Added portrait thumbnails beside every drafted team role for faster at-a-glance team reading.
- Added initials and empty-slot fallbacks so the team board stays readable while portraits are unavailable.

### Roster
- Expanded from 16 to 24 built-in anime series and from 294 to 527 characters.
- Added JoJo's Bizarre Adventure, Fairy Tail, Solo Leveling, Mob Psycho 100, Tokyo Ghoul, DAN DA DAN, Kaiju No. 8, and Fire Force.
- Deepened every existing series with more supporting characters, rivals, villains, and late-series fighters.

## v0.5.0 — Stabilization release

### Security
- Added strict `.fusionpack` validation before import.
- Rejected non-image data URLs, oversized fields, invalid genders, malformed structures, and stored-XSS payloads.
- Escaped imported/user-controlled values before HTML or attribute interpolation.

### Fixes
- Rendering no longer scrolls the page to the top; navigation does so only when the screen changes.
- Added centralized animation cancellation and stale Quick Reveal run protection.
- Prevented PK matches from starting with undersized pools.
- Preserved PK setup selections when gender filters change.
- Added support for picking the final single character and an emergency End Match path for empty pools.
- History saves are de-duplicated and retain stable character IDs.
- Unspecified-gender characters are excluded from male/female filters and surfaced in Setup.

### Storage
- Upgraded IndexedDB to v2 with a dedicated `images` Blob store.
- Migrates v0.4.1 inline pack images to Blob-backed `imageKey` records without destroying old data if a write fails.
- Downscales pack uploads to a maximum 512px long edge and targets sub-150KB storage.
- Added persistent-storage request, storage estimate in Settings, Blob URL cleanup, and a 14-day export reminder.
- `.fusionpack` export remains `animefusion-pack-v1` and self-contained.

### Portraits
- Removed runtime AniList fuzzy matching.
- Moved the built-in roster to `data/roster.json` with stable character IDs and AniList search titles.
- Added a Node 20 build-time portrait resolver, override file, generated manifest, and GitHub Action.
- Built-in portraits display directly from `data/portraits.json`; offline saving is optional.

### i18n
- Completed English, Simplified Chinese, and Japanese UI strings for current v0.5 screens, toasts, traits, PK roles, storage messages, and errors.
- The image-generation prompt intentionally stays in English.

### Tooling
- Added `logic.js` pure shared helpers for browser and Node.
- Added Node test coverage for pack validation, version comparison, PK requirements, shuffle, name matching, and version consistency.
- Added GitHub Actions for tests and portrait resolution.
