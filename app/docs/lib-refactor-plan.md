# Lib / Utils / Constants — Refactoring Plan

**Goal:** Consolidate 50+ scattered utility files into a logical, navigable structure, eliminate
cross-component duplication, enforce consistent patterns, and standardize the design system —
without changing any runtime behaviour. Each step is independently safe to ship.

**Two phases:**

- **Phase A (Steps 1–15):** Reorganise the `lib/` layer — file moves, merges, deduplication.
- **Phase B (Steps 16–27):** Broader codebase cleanup — inline logic extraction, missing-utility
  adoption, pattern standardization, and design-token consolidation.

**Approach:** Steps are ordered by risk (lowest first). Later steps may depend on earlier ones.

---

## Current pain-map

```
src/lib/
  constants.js          ← dead file (zero importers)
  format.js             ← date + number formatting mixed together (25 importers)
  apiErrors.js          ← well scoped ✓
  appVersionCompare.js  ← single concern, fine
  mapSystemSettingsByKey.js  ← one function, lives at root for no reason
  otpPreviewSession.js  ← localStorage helpers, fine
  phoneCodes.js  \
  phoneMetadata.js/     ← phone data split across two files
  playerRankingProfile.js  ← single function, belongs in utils/
  profileStrength.js    ← single function, belongs in utils/
  returningUser.js      ← localStorage helpers, fine
  savedProfiles.js      ← localStorage helpers, fine

  constants/
    assets.js        ✓ (most imported file in project)
    layout.js        ✓
    tableStyles.js   ✓
    search.js        ✓
    geo.js           ← single constant, candidate for merge
    navbar.js        ← Tailwind class constants
    navigation.js    ✓
    teamAssets.js    ← single object
    scoringActionMenu.js  ← scoring data, could move to scoring domain
    combinedWicketDismissals.js  ← cricket constants
    dismissalCaughtVariants.js   ← MIXED: constants + functions (wrong place)
    dismissalGridIcons.js        ← FUNCTION in constants/ (wrong place)
    dismissalGridShortcuts.js    ← MIXED: constants + functions (wrong place)
    liveBroadcastLayout.js       ← single concern
    ui.js            ← dead file (zero importers)

  utils/
    scoringMappers.js     ← large, high usage ✓
    scoringUtils.js       ← large, has date dupe with dateUtils
    playerUtils.js        ✓
    tournamentUtils.js    ✓
    dateUtils.js          ← toApiDate duplicated in scoringUtils
    displayUtils.js       ← formatDecimal duplicated in matchPlayerStatsUtils
    dismissalSharedUtils.js  ← single function
    scorecardUtils.js     ✓
    routeUtils.js         ✓
    fileUploadUtils.js    ✓
    liveStreamUtils.js    ← youtubeEmbedUtils could be absorbed here
    youtubeEmbedUtils.js  ← single function, same domain as liveStreamUtils
    phoneUtils.js         ← phone formatting, related to phoneCodes/phoneMetadata
    penaltyRunsUtils.js   ← mixed constants + logic
    noBallExtras.js       ← mixed constants + logic
    wideBallExtras.js     ← mirrors noBallExtras pattern
    overthrowExtras.js    ← mixed constants + logic
    runOutUtils.js        ← RUNOUT_EXTRA_RUN_OPTIONS duplicates EXTRA_RUN_OPTIONS
    extraRunOptions.js    ← single constant
    retiredHurtUtils.js   ← single function
    retiredOutUtils.js    ← single function
    obstructTheFieldUtils.js  ← single function
    caughtOutUtils.js     ← single function
    specialDismissalUtils.js  ← two functions
    editBallUtils.js      ✓
    wicketSummaryModel.js    ← closely related to wicketSummaryDisplay
    wicketSummaryDisplay.js  ← closely related to wicketSummaryModel
    cricketRules.js       ✓
    ballDisplay.js        ← single function
    shotAreaUtils.js      ✓
    badgeUtils.js         ← single function
    enumUtils.js          ← single function
    matchPlayerStatsUtils.js  ← formatMatchStatRate duplicates displayUtils.formatDecimal
    matchRulesViewModel.js    ← single function
    teamUtils.js          ✓
    replaceBowlingStatsUtils.js  ← two functions
    replaceBattingStatsUtils.js  ← two functions

  validations/
    auth.js             ← phoneSchema defined here
    tournamentRequest.js ← phoneSchema defined AGAIN here (duplicate)
    startMatch.js       ✓
    team.js             ✓
    fileUpload.js       ✓
```

---

## Step 1 — Delete confirmed dead files

**Risk: Zero.** Nothing imports these.

**Files to delete:**

- `src/lib/constants.js` — exports `APP_NAME`, `APP_ID`; zero importers
- `src/lib/constants/ui.js` — exports `DASH = '—'`; zero importers

**Action:** Delete both files. No import updates needed.

---

## Step 2 — Move misplaced single-function root files into utils/

Three files sit loose at `src/lib/` but are utility functions that belong in `utils/`:

| File                            | Move to                            | Merge into                                        |
| ------------------------------- | ---------------------------------- | ------------------------------------------------- |
| `lib/profileStrength.js`        | `lib/utils/playerUtils.js`         | Add `calculateProfileStrength` export             |
| `lib/playerRankingProfile.js`   | `lib/utils/playerUtils.js`         | Add `getProfileRankingParamsByPlayingRole` export |
| `lib/mapSystemSettingsByKey.js` | `lib/utils/settingsUtils.js` (new) | New file, single export                           |

**Import path changes (2 files):**

- `profileStrength.js` → 5 files: `from '@/lib/profileStrength'` → `from '@/lib/utils/playerUtils'`
- `playerRankingProfile.js` → 1 file: update import path
- `mapSystemSettingsByKey.js` → 3 files: `from '@/lib/mapSystemSettingsByKey'` → `from '@/lib/utils/settingsUtils'`

---

## Step 3 — Fix functions incorrectly placed in constants/

Three `constants/` files export **functions**, not just constants. Functions belong in `utils/`.

| File                                   | What's wrong                                                                                | Action                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `constants/dismissalGridIcons.js`      | Exports only `getDismissalGridIconKey` (a function)                                         | Move to `utils/dismissalUtils.js` (new)                     |
| `constants/dismissalCaughtVariants.js` | Exports constants + `injectCaughtDismissalVariants`, `isCaughtDismissalVariant` (functions) | Keep constants, move functions to `utils/dismissalUtils.js` |
| `constants/dismissalGridShortcuts.js`  | Exports constants + `appendDismissalGridShortcuts` (function)                               | Keep constants, move function to `utils/dismissalUtils.js`  |

**Result:** New `src/lib/utils/dismissalUtils.js` containing the three extracted functions.
Constants stay in their respective `constants/` files.

**Import path changes:** Update the 1 importer of each function to use `@/lib/utils/dismissalUtils`.

---

## Step 4 — Fix duplicate `phoneSchema` in validations

`phoneSchema` is defined independently in both `validations/auth.js` and `validations/tournamentRequest.js`.

**Action:**

- Extract shared `phoneSchema` into `validations/shared.js` (new file)
- Import it in both `auth.js` and `tournamentRequest.js`

**No external import changes** — only internal to the two validation files.

---

## Step 5 — Consolidate phone data files

`lib/phoneCodes.js` and `lib/phoneMetadata.js` both serve the phone input feature and are
always used together.

**Action:** Merge both into `lib/phoneCodes.js` (keep the more descriptive name, absorb
`phoneMetadata` exports). Delete `phoneMetadata.js`.

**Import changes:** 2 files that imported `phoneMetadata` update to import from `phoneCodes`.

---

## Step 6 — Merge `youtubeEmbedUtils` into `liveStreamUtils`

`youtubeEmbedUtils.js` has a single export (`buildYoutubeEmbedUrl`) and operates in the
same domain as `liveStreamUtils.js`.

**Action:** Move `buildYoutubeEmbedUrl` into `liveStreamUtils.js`. Delete `youtubeEmbedUtils.js`.

**Import changes:** 1 importer updates path from `youtubeEmbedUtils` to `liveStreamUtils`.

---

## Step 7 — Fix `dateUtils` / `scoringUtils` date duplication

`scoringUtils.formatDateForApi` and `dateUtils.toApiDate` both convert various date inputs
to `YYYY-MM-DD`. They have slightly different implementations serving the same purpose.

**Action:**

- Verify both implementations handle the same edge cases (read both carefully)
- Consolidate into `dateUtils.toApiDate` (it's the correctly-named, correctly-located one)
- Remove `formatDateForApi` from `scoringUtils.js`
- Update the 2 callers of `formatDateForApi` to use `dateUtils.toApiDate`

**Risk: Low** — behaviour must be verified identical before deleting old function.

---

## Step 8 — Fix `formatDecimal` duplication between `displayUtils` and `matchPlayerStatsUtils`

`displayUtils.formatDecimal(val, decimals)` and `matchPlayerStatsUtils.formatMatchStatRate(val)`
both apply `toFixed` with a `'—'` null fallback. The stat one is a single-decimal specialisation.

**Action:**

- Keep `displayUtils.formatDecimal` as the canonical version
- Replace `matchPlayerStatsUtils.formatMatchStatRate` with a call to `formatDecimal(val, 1)`
- Or keep `formatMatchStatRate` as a one-liner wrapper around `formatDecimal` for clarity

**Import changes:** None externally — internal change within `matchPlayerStatsUtils.js`.

---

## Step 9 — Consolidate `dismissalSharedUtils` into scoring utils

`lib/utils/dismissalSharedUtils.js` exports a single function `playerNameById`. Now that we
have `dismissalUtils.js` (from Step 3), this belongs there.

**Action:** Move `playerNameById` into `lib/utils/dismissalUtils.js`. Delete `dismissalSharedUtils.js`.

**Import changes:** 4 files update `from '@/lib/utils/dismissalSharedUtils'` → `from '@/lib/utils/dismissalUtils'`.

---

## Step 10 — Consolidate single-function dismissal util files

These files each export a single `*SelectionToUiFields` function following the exact same pattern:

- `retiredHurtUtils.js` → `retiredHurtSelectionToUiFields`
- `retiredOutUtils.js` → `retiredOutSelectionToUiFields`
- `obstructTheFieldUtils.js` → `obstructSelectionToUiFields`
- `caughtOutUtils.js` → `caughtOutSelectionToUiFields`
- `specialDismissalUtils.js` → `mankadSelectionToUiFields`, `timedOutSelectionToUiFields`

**Action:** Merge all five into a single `lib/utils/dismissalSelectionUtils.js`.

**Import changes:** ~10 files update their import paths. All existing exports keep their names.

---

## Step 11 — Merge `wicketSummaryModel` and `wicketSummaryDisplay`

Both have 1 importer each, tightly coupled domain, and small file size.

**Action:** Merge into `lib/utils/wicketSummaryUtils.js`. Delete the two originals.

**Import changes:** 2 files update their import paths.

---

## Step 12 — Consolidate `runOutUtils` duplicate constant

`runOutUtils.RUNOUT_EXTRA_RUN_OPTIONS` is `[0,1,2,3,4,5,6]` — identical to
`extraRunOptions.EXTRA_RUN_OPTIONS`.

**Action:**

- Remove `RUNOUT_EXTRA_RUN_OPTIONS` from `runOutUtils.js`
- Import `EXTRA_RUN_OPTIONS` from `lib/utils/extraRunOptions.js` in `runOutUtils.js`

**Import changes:** Internal only — `runOutUtils.js` already co-located with `extraRunOptions.js`.

---

## Step 13 — Merge small single-function utils into logical groups

A collection of single-function files can be absorbed into existing or new grouped files:

| File                                 | Action                                                 |
| ------------------------------------ | ------------------------------------------------------ |
| `badgeUtils.js` (`formatCountBadge`) | Merge into `displayUtils.js`                           |
| `enumUtils.js` (`enumNameToValue`)   | Keep standalone — used across multiple domains         |
| `ballDisplay.js` (`getBallDisplay`)  | Keep standalone — imported by both scoring + balls tab |
| `dismissalSharedUtils.js`            | Done in Step 9                                         |

---

## Step 14 — Merge `replaceBowlingStatsUtils` and `replaceBattingStatsUtils`

Both serve the "Replace Stats" dialog feature and together have 4 exports across 2 files.

**Action:** Merge into `lib/utils/replaceStatsUtils.js`. Delete the two originals.

**Import changes:** 2 files (the two Replace Stats dialogs) update their import paths.

---

## Step 15 — `format.js` split: date vs. number formatting

`lib/format.js` mixes date formatting and number/list formatting (25 importers). This is a
lower-priority cleanup since the file is well-used and works correctly.

**Deferred** — address only if the mixed concerns become a maintenance problem. Adding new
date utilities to `dateUtils.js` is the preferred path forward.

---

## Final target structure

```
src/lib/
  apiErrors.js          ← unchanged
  format.js             ← unchanged (deferred split)
  appVersionCompare.js  ← unchanged
  otpPreviewSession.js  ← unchanged
  phoneCodes.js         ← absorbs phoneMetadata (Step 5)
  returningUser.js      ← unchanged
  savedProfiles.js      ← unchanged

  constants/
    assets.js           ← unchanged
    layout.js           ← unchanged
    tableStyles.js      ← unchanged
    search.js           ← unchanged
    geo.js              ← unchanged
    navbar.js           ← unchanged
    navigation.js       ← unchanged
    teamAssets.js       ← unchanged
    scoringActionMenu.js← unchanged
    combinedWicketDismissals.js  ← unchanged
    dismissalCaughtVariants.js   ← constants only (functions moved to utils/)
    dismissalGridShortcuts.js    ← constants only (function moved to utils/)
    liveBroadcastLayout.js       ← unchanged
    ❌ dismissalGridIcons.js     ← function moved to utils/dismissalUtils.js
    ❌ constants.js              ← deleted (Step 1)
    ❌ ui.js                     ← deleted (Step 1)

  utils/
    scoringMappers.js       ← unchanged
    scoringUtils.js         ← formatDateForApi removed (Step 7)
    playerUtils.js          ← +calculateProfileStrength, +getProfileRankingParamsByPlayingRole (Step 2)
    tournamentUtils.js      ← unchanged
    dateUtils.js            ← canonical date-to-API conversion (Step 7)
    displayUtils.js         ← +formatCountBadge (Step 13)
    settingsUtils.js        ← NEW: mapSystemSettingsByKey (Step 2)
    dismissalUtils.js       ← NEW: getDismissalGridIconKey, injectCaughtDismissalVariants,
                               isCaughtDismissalVariant, appendDismissalGridShortcuts,
                               playerNameById (Steps 3, 9)
    dismissalSelectionUtils.js ← NEW: all *SelectionToUiFields functions (Step 10)
    wicketSummaryUtils.js   ← NEW: merges wicketSummaryModel + wicketSummaryDisplay (Step 11)
    replaceStatsUtils.js    ← NEW: merges replaceBowlingStats + replaceBattingStats (Step 14)
    scorecardUtils.js       ← unchanged
    routeUtils.js           ← unchanged
    fileUploadUtils.js      ← unchanged
    liveStreamUtils.js      ← +buildYoutubeEmbedUrl (Step 6)
    phoneUtils.js           ← unchanged
    penaltyRunsUtils.js     ← unchanged
    noBallExtras.js         ← unchanged
    wideBallExtras.js       ← unchanged
    overthrowExtras.js      ← unchanged
    runOutUtils.js          ← RUNOUT_EXTRA_RUN_OPTIONS removed (Step 12)
    extraRunOptions.js      ← unchanged
    retiredHurtUtils.js     ← merged into dismissalSelectionUtils (Step 10)
    retiredOutUtils.js      ← merged into dismissalSelectionUtils (Step 10)
    obstructTheFieldUtils.js← merged into dismissalSelectionUtils (Step 10)
    caughtOutUtils.js       ← merged into dismissalSelectionUtils (Step 10)
    specialDismissalUtils.js← merged into dismissalSelectionUtils (Step 10)
    editBallUtils.js        ← unchanged
    cricketRules.js         ← unchanged
    ballDisplay.js          ← unchanged
    shotAreaUtils.js        ← unchanged
    enumUtils.js            ← unchanged
    matchPlayerStatsUtils.js← formatMatchStatRate uses displayUtils.formatDecimal (Step 8)
    matchRulesViewModel.js  ← unchanged
    teamUtils.js            ← unchanged
    badgeUtils.js           ← merged into displayUtils (Step 13)
    ❌ dismissalSharedUtils.js    ← merged into dismissalUtils (Step 9)
    ❌ youtubeEmbedUtils.js       ← merged into liveStreamUtils (Step 6)
    ❌ wicketSummaryModel.js      ← merged into wicketSummaryUtils (Step 11)
    ❌ wicketSummaryDisplay.js    ← merged into wicketSummaryUtils (Step 11)
    ❌ replaceBowlingStatsUtils.js← merged into replaceStatsUtils (Step 14)
    ❌ replaceBattingStatsUtils.js← merged into replaceStatsUtils (Step 14)
    ❌ matchPlayerStatsUtils.js playerRankingProfile.js  ← merged into playerUtils (Step 2)
    ❌ profileStrength.js   ← merged into playerUtils (Step 2)

  validations/
    auth.js             ← imports phoneSchema from shared.js (Step 4)
    tournamentRequest.js← imports phoneSchema from shared.js (Step 4)
    shared.js           ← NEW: shared phoneSchema (Step 4)
    startMatch.js       ← unchanged
    team.js             ← unchanged
    fileUpload.js       ← unchanged
```

---

## Execution order and dependencies

```
Step 1   Delete dead files          — no dependencies, zero risk
Step 2   Root files → utils/        — independent
Step 3   Functions out of constants/ — independent
Step 4   phoneSchema dedup          — independent
Step 5   Phone data merge           — independent
Step 6   YouTube → liveStream       — independent
Step 7   Date util dedup            — depends on nothing but needs careful verification
Step 8   formatDecimal dedup        — independent
Step 9   dismissalSharedUtils       — can run after Step 3 (goes into dismissalUtils)
Step 10  Dismissal selection merge  — independent
Step 11  WicketSummary merge        — independent
Step 12  runOut constant dedup      — independent
Step 13  Single-function merges     — independent
Step 14  Replace stats merge        — independent
Step 15  format.js split            — deferred
```

Steps 1–6 and 8–14 have no inter-dependencies and can be done in any order.
Step 9 should run after Step 3 so `playerNameById` lands in the already-created `dismissalUtils.js`.
Step 7 requires careful manual verification before execution.

---

## Risk notes per step

| Step | Risk                                              | Mitigation                                             |
| ---- | ------------------------------------------------- | ------------------------------------------------------ |
| 1    | Zero — confirmed zero importers                   | Run lint after to confirm                              |
| 2–6  | Very low — file moves + import updates            | Lint after each step                                   |
| 7    | Medium — behavioural equivalence must be verified | Read both implementations side by side before deleting |
| 8–14 | Low — consolidation only, no logic changes        | Lint after each step                                   |

---

## Measuring success

| Metric                    | Before  | Target |
| ------------------------- | ------- | ------ |
| Files in `lib/` root      | 12      | 8      |
| Files in `lib/utils/`     | 38      | 28     |
| Duplicate logic instances | 5       | 0      |
| Functions in `constants/` | 3 files | 0      |
| Dead files                | 2       | 0      |

---

---

# Phase B — Broader Codebase Review

**Goal:** Eliminate duplicated inline logic across components, enforce adoption of existing
utilities, standardize UX patterns, and consolidate the design system. These are the technical
debts that exist _before_ the lib migration and should be resolved alongside it.

---

## Step 16 — Consolidate `getInitials` — 5 independent implementations

`displayUtils.getInitials` exists but is only used in 2 of 6 call sites.

**Problem locations:**

- `pages/NotificationCenter.jsx` — full reimplementation (`.split(' ').filter().map().join()`)
- `pages/scorecard/tabs/StatsTab.jsx` — local `getPlayerInitials()` (has a `// CURSOR` comment noting it should be merged)
- `pages/ranking/Ranking.jsx` — inline `.slice(0, 2).toUpperCase()` in `AvatarFallback`
- `pages/reels/UploadReels.jsx` — inline `.slice(0, 2).toUpperCase()` in `AvatarFallback`
- `pages/shop/OrderDetail.jsx` — `name.charAt(0).toUpperCase()` (single initial only)

**Action:** Replace all 4 reimplementations with `import { getInitials } from '@/lib/utils/displayUtils'`.
`OrderDetail.jsx` uses only the first character — pass `maxLength: 1` or keep the single `charAt(0)` as an intentional variant.

---

## Step 17 — Extract `calculateStrikeRate` utility — 4 duplicates

Strike rate `(runs / balls * 100).toFixed(N)` is computed inline in 4 separate files with
inconsistent precision.

**Problem locations:**

- `components/scoring/BatsmenTable.jsx` — standalone `calcSR()`, `toFixed(1)`
- `pages/organizer/scoring/scoring-tabs/ScoringTab.jsx` — inline in `getBatsmanDisplayStats`, `toFixed(1)`
- `pages/scorecard/ScorecardStatusDetails.jsx` — inline in `toBatter()` `useMemo`, `toFixed(2)` ← different precision
- `pages/organizer/scoring/scoring-tabs/StatsTab.jsx` — inline, `toFixed(1)`

**Action:**

- Add `calculateStrikeRate(runs, balls, decimals = 1)` to `lib/utils/matchPlayerStatsUtils.js`
- Returns `'—'` for 0 balls (consistent with other stat formatters)
- Replace all 4 inline implementations

---

## Step 18 — Move `formatCount` and `formatPostTimestamp` out of a component file

**Problem:** `pages/feed/PostCard.jsx` exports utility functions (`formatCount`, `formatPostTimestamp`).
`ActivityFeedDetail.jsx` imports them directly from a page component — a structural anti-pattern.

**Action:**

- Move `formatCount` → `lib/format.js` (alongside `formatPrice`, `formatDate`)
- Move `formatPostTimestamp` → `lib/utils/feedUtils.js` (new file) — it does date humanisation
  specific to the feed domain
- Update imports in `PostCard.jsx` and `ActivityFeedDetail.jsx`

---

## Step 19 — Add `formatRelativeDate` to eliminate divergent humanized-date implementations

**Problem:** Two files roll their own relative-time logic:

- `pages/shop/MyOrders.jsx` — `getHumanizedDate()` (minutes/hours/days ago → falls back to `formatDate`)
- `pages/NotificationCenter.jsx` — uses `new Date().toLocaleString()` with no humanization

These produce different formats, different timezone handling, and different fallback behaviour.

**Action:**

- Add `formatRelativeDate(dateString)` to `lib/format.js`
- Consistent logic: seconds/minutes/hours/days ago → fallback to `formatDate`
- Replace `getHumanizedDate` in `MyOrders.jsx` and the `toLocaleString` call in `NotificationCenter.jsx`

---

## Step 20 — Fix `formatPrice` bypass in pricing pages

`lib/format.js → formatPrice` is correctly used across all shop pages, but the pricing pages bypass it.

**Problem locations:**

- `pages/pricing/Pricing.jsx` — `{price.toLocaleString('en-PK')}` inline
- `pages/pricing/PricingDetail.jsx` — `{price.toLocaleString('en-PK')}` inline

**Action:** Replace both with `formatPrice(price)` from `lib/format.js`. 2-line change.

---

## Step 21 — Fix `formatDecimal` bypass in ranking and scorecard pages

`displayUtils.formatDecimal` exists for null-safe `toFixed` with `'—'` fallback but is bypassed
in 5 locations:

- `pages/ranking/Ranking.jsx` — `Number(player.economy).toFixed(2)`, `Number(player.average).toFixed(2)`
- `pages/ranking/RankingStatsTotal.jsx` — same inline pattern (×2)
- `pages/scorecard/StatsTotal.jsx` — same inline pattern (×2)
- `pages/scorecard/tabs/StatsTab.jsx` — `player.average.toFixed(2)` (no null guard)

**Action:** Replace all with `formatDecimal(value, 2)` from `displayUtils.js`.

---

## Step 22 — Consolidate stats-row mappers (`getStatsTotalRows` / `getRankingStatsTotalRows`)

**Problem:** `StatsTotal.jsx` and `RankingStatsTotal.jsx` both implement a large `if/else` block
mapping 4 stat categories (run-scorers, wicket-takers, fours, sixes) to table rows. `StatsTotal.jsx`
even has a `// CURSOR: move to src/lib/utils/rankingUtils.js` comment at line 181 acknowledging this.

**Action:**

- Create `lib/utils/rankingUtils.js` (new file)
- Extract shared logic into `buildStatsTotalRows(statType, data, nameMap)` accepting both API shapes
- Both pages call the shared utility; page-specific API normalization stays in the page
- Delete local functions from both files

---

## Step 23 — Standardize error handling pattern

**Problem:** Three different error handling patterns coexist:

1. `console.error` only — auth pages (`Login.jsx`, `Register.jsx`) — silent failure, no UX feedback
2. `toast.error(getApiErrorMessage(err, fallback))` — most organizer/scoring pages ✅ correct
3. `toast.error(hardcodedString)` — shop pages — bypass the API error message utility

**Action:**

- `Login.jsx`, `Register.jsx`: add `toast.error(getApiErrorMessage(err, ...))` — auth errors should surface
- Shop pages using raw strings: replace with `getApiErrorMessage(err, fallback)`
- Document the standard in a comment in `lib/apiErrors.js` as the canonical pattern

---

## Step 24 — Add `SEARCH_RESULTS_LIMIT` to `lib/constants/search.js`

**Problem:** Two components independently define the same constant:

- `components/shop/ShopSearchPopover.jsx` line 10 — `const SEARCH_RESULTS_LIMIT = 8`
- `components/highlights/HighlightSearchPopover.jsx` line 11 — `const SEARCH_RESULTS_LIMIT = 8`

`lib/constants/search.js` already has `MIN_SEARCH_LENGTH` and `DEBOUNCE_MS` but is missing this.

**Action:** Add `export const SEARCH_RESULTS_LIMIT = 8` to `lib/constants/search.js`.
Update both component files to import it.

---

## Step 25 — Consolidate `BORDER` / `BORDER_ALT` confusion in `tableStyles.js`

**Problem:** `tableStyles.js` exports `BORDER` and `BORDER_ALT` as slightly different shades.
Four files import `BORDER_ALT` but alias it as `BORDER` — `import { BORDER_ALT as BORDER }` —
indicating the split is unintentional and both constants serve the same purpose.

**Action:**

- Audit visually: confirm `BORDER` and `BORDER_ALT` are indistinguishable
- If identical purpose: remove `BORDER_ALT`, update 4 aliases to plain `BORDER`
- If intentionally different: document why in `tableStyles.js`

---

## Step 26 — Fix Tailwind hex-case inconsistency

**Problem:** The same logical color appears in mixed case across the codebase:

- `bg-[#1c1c1a]` vs `bg-[#1C1C1A]` — 37 occurrences split between cases
- `bg-[#1a1a18]` / `bg-[#1a1a1a]` / `bg-[#1A1A1A]` — 23 occurrences mixed

Tailwind treats hex values as case-sensitive for JIT class detection, which can cause cache
inconsistencies and generate duplicate CSS rules.

**Action:** Standardize to UPPERCASE hex for all Tailwind arbitrary values (matches the
predominant pattern already used in `bg-[#141412]`, `text-[#DA9811]` etc.).
Run a global find-replace for each mixed-case pair.

---

## Step 27 — Tailwind design tokens (deferred — large scope)

The most pervasive technical debt in the UI layer is raw hex strings hardcoded everywhere:

| Value                        | Occurrences | Semantic meaning            |
| ---------------------------- | ----------- | --------------------------- |
| `text-[#A2A6AB]`             | 378         | Muted / secondary text      |
| `text-[#DA9811]`             | 211         | Brand gold / primary accent |
| `bg-[#DA9811]`               | 95          | Brand gold background       |
| `bg-[#141412]`               | 196         | Card / surface background   |
| `text-[13px] text-[#A2A6AB]` | 115         | Secondary label (combined)  |

**Ideal action:** Extend `tailwind.config.js` with semantic color tokens:

```js
colors: {
  brand: '#DA9811',
  surface: '#141412',
  'surface-raised': '#1C1C1A',
  muted: '#A2A6AB',
  ...
}
```

Then `text-[#A2A6AB]` → `text-muted`, `bg-[#141412]` → `bg-surface`, etc.

**Why deferred:** This affects 800+ lines across 150+ files. It is a pure mechanical
find-replace with zero logic risk, but the scope makes it a dedicated sprint.
Recommend doing this as a follow-up after Phase A and Steps 16–26 are complete.

---

## Phase B execution order and dependencies

```
Step 16  getInitials consolidation          — independent
Step 17  Strike rate extraction             — independent
Step 18  formatCount / formatPostTimestamp  — independent
Step 19  formatRelativeDate                 — independent (new utility)
Step 20  formatPrice bypass fix             — independent (2-line change)
Step 21  formatDecimal bypass fix           — independent
Step 22  Stats row mapper consolidation     — independent
Step 23  Error handling standardization     — independent
Step 24  SEARCH_RESULTS_LIMIT constant      — independent
Step 25  BORDER / BORDER_ALT cleanup        — independent
Step 26  Tailwind hex case fix              — independent
Step 27  Tailwind design tokens             — deferred, own sprint
```

All Phase B steps are independent of each other and of Phase A steps.
Steps 20–21 can be done in minutes. Steps 17, 18, 22 require more care.

---

## Updated measuring success

| Metric                              | Before  | Target |
| ----------------------------------- | ------- | ------ |
| Files in `lib/` root                | 12      | 8      |
| Files in `lib/utils/`               | 38      | 28     |
| Duplicate utility implementations   | 10      | 0      |
| Functions in `constants/`           | 3 files | 0      |
| Dead files                          | 2       | 0      |
| Existing utilities bypassed         | 6       | 0      |
| Inconsistent error handling sites   | 8       | 0      |
| Inline constants needing extraction | 4       | 0      |
| Mixed-case Tailwind hex classes     | 60      | 0      |
