# Changelog

## Unreleased

### PK Draft
- Rebuilt the active draft as a one-screen, touch-friendly board with bottom candidate cards, tap or drag-to-role placement, reveal/drop animations, and one skip per player.
- Added the shared-roster $100 Budget PK with alternating turns, four price tiers, and automatic minimum-budget reservation for remaining roles.
- Added six series-specific role titles and a localized dedicated battlefield for all 24 series.
- Updated image and judge prompts to use five direct matchups while each betrayal role attacks its own former team.

### Gallery, names and portraits
- Replaced Private Packs with Character Gallery and removed pack import, export, editing, validation, storage state, and documentation.
- Completed English, Simplified Chinese, and Japanese name fields for all 628 characters.
- Added conservative phase-image gating: a selected form only shows a portrait after that exact/default artwork has been reviewed; otherwise initials are shown instead of a wrong form.

## v0.5.2 — Scenario prompts and roster expansion

### Trait Draft and Quick Randomizer
- Added Rival, Mentor, Final Boss, Isekai Reincarnation, Adventure Party Member, and Roommate scenarios.
- Added three localized scene presets to every scenario; one is selected per completed fusion and remains stable when copied again.
- Renamed theme selection to scenario selection and preserved custom choices across reloads.

### PK Team Draft
- Added a localized All-Star Battle image prompt with three neutral battlefields.
- Made Traitor, Rogue Ninja, Defector, Curse User, and Demon Traitor mandatory betrayal roles in judge prompts.
- Required verdict reasoning to compare how both betrayal slots affect their own teams.

### Roster and portraits
- Expanded from 527 to 628 characters; every built-in anime now has at least 25 characters.
- Increased verified portrait coverage to 627 of 628 characters.
- Added franchise-checked AniList overrides and corrected cross-series portrait mismatches.
- Kept Kefla unresolved because no verified AniList character entry was available.

### Tooling
- Made portrait workflow commits stay on the triggering branch.
- Reused existing verified portraits so resolver runs only process new or overridden entries.
- Added tests enforcing minimum roster size and unique character IDs.

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

### Fixes
- Rendering no longer scrolls the page to the top; navigation does so only when the screen changes.
- Added centralized animation cancellation and stale Quick Reveal run protection.
- Prevented PK matches from starting with undersized pools.
- Preserved PK setup selections when gender filters change.
- Added support for picking the final single character and an emergency End Match path for empty pools.
- History saves are de-duplicated and retain stable character IDs.
- Unspecified-gender characters are excluded from male/female filters and surfaced in Setup.

### Storage
- Upgraded IndexedDB to v2 with a dedicated `images` Blob store for optional offline portraits.
- Added storage estimates in Settings and Blob URL cleanup.

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
- Added Node test coverage for version comparison, PK requirements, shuffle, name matching, and version consistency.
- Added GitHub Actions for tests and portrait resolution.
