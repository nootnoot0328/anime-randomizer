# Changelog

## v1.2.0 — Appearance split into four traits

### Trait Draft & Quick Randomizer
- "Appearance" is now four separate traits: **Hair, Face, Outfit and Physique**, in Partner, Villain, Rival, Mentor, Final Boss, Adventure Party and Roommate. Protagonist and Isekai already used them.
- Partner's separate "Body" trait is merged into Physique, so there's no duplicate body slot.
- Saved setups convert automatically: if Appearance was ticked, all four new traits are ticked; Body becomes Physique. Old History entries still show "Appearance" as they were saved.
- Those scenarios gain 1–3 rounds (e.g. Villain 10 → 13 traits). Untick any you don't want; the choice is remembered.

## v1.1.0 — A computer opponent that knows the characters

### Computer opponent
- Every character now has ratings the computer reasons with: power, leadership, durability, healing and strategy (0–10), plus overrides for verified forms. 628 characters in `src/data/attributes.js`, one editable line each.
- **Strategic** fills roles by fit, matching how the AI referee judges: real healers go to the healer slot, strategists to strategy, and the traitor slot goes to whoever does the least damage when they betray. It saves its skip for pairs that are clearly worse than what's left.
- **Budget (Strategic)** plans a full $100 lineup before every purchase, buys the most contested piece of the plan first, and uses its one sale when selling back a bad fit makes a clearly better lineup affordable.
- **Casual** uses the same judgement with deliberate noise and the odd careless role, so it's beatable but no longer random.
- The computer's picks, skips and sales are announced, and each Gallery character card shows its ratings and best roles.

### Measured (simulated drafts, all 24 series)
- When a real healer is offered, Strategic slots one as healer 97% of the time (v1.0.0: 6% overall).
- Average power of its traitor fell from 6.9 to 4.2; leader-slot leadership rose from 5.4 to 7.6, tank-slot durability from 5.9 to 8.0.

## v1.0.0 — AI referee, app redesign, rebuilt codebase

### AI referee and commentator
- Finished PK battles are judged in-app through the Setpoint Worker with a game-only key: winner, margin, reasons, biggest factor, MVP, role-by-role edges and 4–6 beats of live commentary in the app language.
- The referee steps in automatically when a match ends (if connected). The first valid verdict is saved with the match and is final.
- Without a Worker the report offers the copy-paste judge prompt, unchanged from v0.6.4.

### Redesign
- PK board fits a phone: teams stack (side by side on wide screens), team name and series always visible, role names wrap, and portraits fill the slots. Fixes cut-off team names and titles in every language.
- Tap a character to assign a role from a sheet; dragging still works in Random PK. Budget roster is a price-sorted grid; tap your own slot to sell.
- New Home with Continue card for an unfinished draft or battle; setup screens with a sticky start bar; full-screen Settings (language, AI referee, portraits, version); History now keeps battles with their verdicts, with filters; Gallery search across all three languages and a character card.
- Motion: screen transitions, sliding segmented controls, bottom sheets with swipe-to-close, slot pop-ins, shuffle blur and settle, staggered commentary and verdict reveal. Everything is off with Reduce Motion.
- Portraits that fail to load fall back to coloured initials instead of broken images.

### Fixes
- Strategic CPU no longer freezes when it decides to skip a cheap pair (v0.6.4 rejected the CPU's own skip).
- Series names in the draft cards and sheets were sometimes shown wrong; now always the character's series.

### Under the hood
- Seven patch-on-patch scripts replaced by ES modules (`src/`); every prompt is pinned by a regression fixture captured from v0.6.4.
- Saved language, history, customizer and offline portraits carry over from v0.6.x.

## v0.6.4 — Father localization hotfix

### Character localization
- Corrected Father's Japanese gallery name to `お父様`.
- Corrected Father's Simplified Chinese gallery name to `父亲大人` instead of displaying Japanese text.
- Added regression coverage for both localized names.

## v0.6.3 — Role-first battle judging

### PK battle judging
- Rebuilt the generated judge prompt around role execution, canon abilities, selected forms, counters, reinforcement, battle progression, endgame paths, and team synergy.
- Added explicit role-by-role matchups, conservative cross-series interaction rules, missing-role consequences, and consistency guidance that prevents simple 1v1 win counting.
- Kept mandatory betrayal analysis in standard PK while automatically removing all traitor instructions from $100 Budget PK.
- Localized the complete framework and its strict short verdict format in English, Simplified Chinese, and Japanese.

## v0.6.2 — Computer opponents

### PK modes
- Added Local 2 Players and VS Computer match types to standard PK and $100 Budget PK.
- Added Casual and Strategic computer difficulties, plus an optional random opponent series in standard PK.
- Added visible computer turns and selection timing while blocking manual taps and drag actions during the computer's turn.
- Strategic computer drafting considers curated character value, remaining budget, complete role coverage, skips, its one sale, and early team completion.
- Localized the complete opponent setup and computer-turn interface in English, Simplified Chinese, and Japanese.

## v0.6.1 — Budget flexibility and reliable form art

### $100 PK
- Removed the betrayal role from Budget PK, leaving five tactical roles per team.
- Added one sale per player with a full refund, plus the option to finish with an incomplete team when the remaining budget cannot fill every role.
- Removed forced budget reservation so players can spend their remaining funds freely.

### Battle judging
- Made role execution, counters, team synergy, empty-role disadvantages, and achievable win conditions primary judging criteria; raw power is now only one factor.
- Kept betrayal analysis exclusively in the standard six-role PK mode.

### Form portraits
- Added an automated cache that downloads reviewed phase/form artwork into the repository so gallery cards no longer depend on fragile third-party hotlinks.

## v0.6.0 — PK board and budget draft

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
