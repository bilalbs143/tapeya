# Scorecard & live scoring (app) — full reference

Everything under **`app/`** that implements or supports **organizer live scoring**, **scorecard read views**, and **related dialogs/utils**. Paths are relative to `app/` unless noted as `app/src/...`.

---

## 1. Routes (`src/App.jsx`)

| Route                                            | Page                                             |
| ------------------------------------------------ | ------------------------------------------------ |
| `/organizer/scoring/start-match`                 | `src/pages/organizer/scoring/StartMatch.jsx`     |
| `/organizer/scoring/match/:matchId`              | `src/pages/organizer/scoring/ScoringMatch.jsx`   |
| `/scorecard`                                     | `src/pages/scorecard/ScorecardHome.jsx`          |
| `/scorecard/:tournamentId`                       | `src/pages/scorecard/ScorecardDetails.jsx`       |
| `/scorecard/:tournamentId/match/:matchId`        | `src/pages/scorecard/ScorecardStatusDetails.jsx` |
| `/scorecard/:tournamentId/stats-total/:statType` | `src/pages/scorecard/StatsTotal.jsx`             |

Nav labels that point at scorecard: `src/lib/constants/navigation.js` (`/scorecard`).

---

## 2. Dialogs — complete list

### 2.1 Scoring-specific folder (`src/components/dialogs/scoring/`)

| File                                     | Purpose                                                                                                     | Used by                                             |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **`OversDialog.jsx`**                    | Pick match overs from enum options                                                                          | `StartMatch.jsx`                                    |
| **`PlayersPerSideDialog.jsx`**           | Pick players per side from enum options                                                                     | `StartMatch.jsx`                                    |
| **`TeamSelectDialog.jsx`**               | Choose home/away team from tournament list                                                                  | `StartMatch.jsx`                                    |
| **`TossDialog.jsx`**                     | Toss winner + bat/bowl before navigating to scoring                                                         | `StartMatch.jsx`                                    |
| **`ExtraRunsDialog.jsx`**                | Enter total runs on WD/NB (and extras flow)                                                                 | `ScoringTab.jsx`                                    |
| **`OutReasonDialog.jsx`**                | Pick dismissal type (from API enums)                                                                        | `ScoringTab.jsx`                                    |
| **`FielderPickerDialog.jsx`**            | Pick fielder when dismissal requires it                                                                     | `ScoringTab.jsx`                                    |
| **`CustomScoreDialog.jsx`**              | Custom run value entry                                                                                      | `ScoringTab.jsx`                                    |
| **`ScoringSquadPlayerPickerDialog.jsx`** | Add/replace batsman or bowler from squad                                                                    | `ScoringTab.jsx` (two instances: batting / bowling) |
| **`TeamNameDialog.jsx`**                 | Team naming UI component (same folder; **no current imports** elsewhere — keep if reused or remove if dead) | —                                                   |

### 2.2 Organizer scoring — not under `dialogs/scoring/`

| File                                                 | Purpose                                                                                                                        | Used by                          |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| **`src/pages/organizer/scoring/ShotAreaDialog.jsx`** | **`ShotAreaDialog`** — stadium map, shot zone → `shot_position` on ball. Exports **`ShotDirectionStats`** (wheel %) for stats. | `ScoringTab.jsx`, `StatsTab.jsx` |

### 2.3 Match shell — Radix `Dialog` (not a separate file)

| Location               | Purpose                                                                                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ScoringMatch.jsx`** | Inline **toss** modal (`Dialog` / `DialogContentDark` / `DialogTitle`) when match is `scheduled` and toss missing — home/away + bat/bowl + **Save Toss** → `useUpdateTossMutation`. |

### 2.4 Global Redux dialog (`inningsEnd`)

| Piece                                             | Role                                                                                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **`src/store/slices/commonSlice.js`**             | **`openDialog`**, **`closeDialog`** — `openDialog({ key: 'inningsEnd', props: { ... } })` from `ScoringMatch.jsx`.         |
| **`src/components/dialogs/DialogManager.jsx`**    | Maps `inningsEnd` → **`InningsEndDialog`**.                                                                                |
| **`src/components/dialogs/InningsEndDialog.jsx`** | First-innings break vs match-over copy; props include `variant`, `reason`, `battingTeamName`, `matchOvers`, `matchResult`. |

---

## 3. Hooks (`src/hooks/`)

| File                      | Exports / role                                                                                                                                                             |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`useInningsState.js`**  | **`useInningsState`**, **`blankBatsman`**, **`blankBowler`**, **`INITIAL_PARTNERSHIP`** — one innings’ ball history, crease, bowlers, partnerships, squads, **`reset()`**. |
| **`useApiMatchSync.js`**  | **`useApiMatchSync`** — hydrate both innings from match + scorecard + playing XI + squads; **`replayBallHistory`**; sort balls before replay.                              |
| **`useScoringEngine.js`** | **`useScoringEngine`** → **`handleRuns`**, **`handleSpecial`**, **`handleOut`**, **`handleUndo`** — pure ball logic + optional `syncBallToApi` / `syncUndoToApi`.          |

---

## 4. Utils — every export

### 4.1 `src/lib/utils/scoringUtils.js`

| Export                                      | Role                                                         |
| ------------------------------------------- | ------------------------------------------------------------ |
| **`formatDateForApi`**                      | Start match form → API date                                  |
| **`formatTimeForApi`**                      | Start match form → API time                                  |
| **`getRunsFromBall`**                       | Runs on a ball (handles API + UI shapes)                     |
| **`ballsToOvers`**                          | Balls → `O.B` string                                         |
| **`computeLiveScore`**                      | Totals, wickets, legal balls, extras, CRR from `ballHistory` |
| **`wouldInningsEndAfterBall`**              | If pending ball ends innings (target / wickets / overs)      |
| **`computePartnership`**                    | Partnership from two crease batsmen                          |
| **`buildBallListWithMetaAndOverSummaries`** | Per-ball labels + over summaries (Balls tab / similar)       |

### 4.2 `src/lib/utils/scoringMappers.js`

| Export                                                     | Role                                       |
| ---------------------------------------------------------- | ------------------------------------------ |
| **`getDismissalOptions`**                                  | Enum → dismissal pick list                 |
| **`dismissalRequiresFielder`**                             | From enum option                           |
| **`getExtraTypeOptions`**                                  | WD / NB / bye / lb buttons                 |
| **`getShotPositionOptions`**                               | Shot area labels (API order)               |
| **`getMatchOversOptions`**, **`getPlayersPerSideOptions`** | Start match pickers                        |
| **`getOptionLabel`**                                       | Label for selected enum value              |
| **`dismissalLabelToValue`**, **`dismissalValueToLabel`**   | Dismissal ↔ API                            |
| **`apiBallToUiBall`**                                      | Single API ball → UI shape                 |
| **`scorecardInningsToBallHistory`**                        | Innings balls → sorted UI history          |
| **`apiPartnershipsToUiState`**                             | API partnerships → UI                      |
| **`computeOverAndBallInOver`**                             | Legal-ball-based over position             |
| **`uiBallToStoreBallPayload`**                             | UI ball → POST ball body                   |
| **`getTossWinnerTeamId`**                                  | Toss winner id (legacy completed handling) |
| **`apiMatchToUiMatchConfig`**                              | Match + squads + scorecard → UI `match`    |
| **`buildPlayerIdToName`**                                  | Id → name map                              |

### 4.3 `src/lib/utils/scoringReplay.js`

| Export                  | Role                                                 |
| ----------------------- | ---------------------------------------------------- |
| **`replayBallHistory`** | Rebuild crease / bowlers / indexes from UI ball list |

### 4.4 `src/lib/utils/scorecardUtils.js`

| Export                                       | Role                                    |
| -------------------------------------------- | --------------------------------------- |
| **`normaliseMatchStatus`**                   | Status string helper                    |
| **`normaliseTournamentMatches`**             | Tournament matches list shape           |
| **`apiTournamentMatchToStatusDetailsMatch`** | Match card row for status details       |
| **`minimalStatusDetailsFromApi`**            | Lightweight header state                |
| **`oversDetailsFromScorecard`**              | Overs string / breakdown from scorecard |
| **`playingXIFromPlayingElevenResponses`**    | Merge home/away XI responses            |
| **`buildMatchStatusDetails`**                | Compose status details view model       |

### 4.5 `src/lib/utils/shotAreaUtils.js`

| Export                            | Role                                                             |
| --------------------------------- | ---------------------------------------------------------------- |
| **`SHOT_ZONE_GEOMETRY`**          | SVG paths + angles per zone id (aligns with API `shot_position`) |
| **`SHOT_DIRECTION_ZONES`**        | Zone id list from geometry                                       |
| **`getShotDirectionPercentages`** | % distribution from `ballHistory` (Stats / wheel)                |

### 4.6 `src/lib/utils/playerUtils.js` (used by scoring hydration)

| Export                         | Role                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| **`squadPlayerProfileFields`** | Extra profile fields on squad rows (`useApiMatchSync`, `ScoringMatch` `buildRoleSquad`) |
| _(other exports)_              | `playerDisplayRole`, `playerProfileRoleLabel`, … — shared profile UI, not scoring-only  |

### 4.7 `src/lib/utils/tournamentUtils.js` (scorecard pages)

| Export                    | Role                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| **`isValidTournamentId`** | Guard routes in `ScorecardDetails.jsx`, `ScorecardStatusDetails.jsx` |

### 4.8 `src/config/matchConfig.js`

| Export                | Role                                                                  |
| --------------------- | --------------------------------------------------------------------- |
| **`toSquadWithRole`** | Normalize `{ id, name, role }` for squad lists (API-oriented helpers) |

### 4.9 `src/pages/scorecard/statsTotalFlow.js`

| Export                                             | Role                               |
| -------------------------------------------------- | ---------------------------------- |
| **`RANKING_FLOW`**, **`SCORECARD_FLOW`**           | Flow constants                     |
| **`VALID_STAT_TYPES`**                             | Allowed stat segments              |
| **`statsTotalPaths`**                              | Path builders ranking vs scorecard |
| **`getFlowFromPath`**, **`getStatsTotalBackPath`** | Router-aware back / flow detection |

### 4.10 Other small deps

- **`src/lib/constants/ui.js`** — **`DASH`** used in `useScoringEngine` for display fallbacks.
- **`src/lib/constants/tableStyles.js`** — **`BORDER`**, **`HEADER_BG`** used in `ScoringTab.jsx`.
- **`src/lib/constants/layout.js`** — **`NAVBAR_HEIGHT`** (e.g. `ScorecardHome.jsx` sticky behavior).
- **`src/lib/apiErrors.js`** — **`getApiErrorMessage`** (`StartMatch.jsx` toasts).
- **`src/lib/validations/startMatch.js`** — **`startMatchSchema`** (Zod) for `StartMatch.jsx`.

---

## 5. Store / API (`src/store/`)

| File                        | What matters for scorecard                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`api/matchApi.js`**       | **Queries:** `getMatch`, `getScorecard`, `getPlayingEleven`. **Mutations:** `storeMatchSquad`, `storePlayingEleven`, `storeBall`, `updateBall`, `deleteBall`, `updateToss`. **Hooks:** `useGetMatchQuery`, `useLazyGetMatchQuery`, `useGetScorecardQuery`, `useLazyGetScorecardQuery`, `useGetPlayingElevenQuery`, `useLazyGetPlayingElevenQuery`, `useStoreMatchSquadMutation`, `useStorePlayingElevenMutation`, `useStoreBallMutation`, `useUpdateBallMutation`, `useDeleteBallMutation`, `useUpdateTossMutation`. |
| **`api/teamApi.js`**        | **`useGetTeamSquadQuery`** (`GET /teams/:id/squad`) — `ScoringMatch.jsx` hydration.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **`api/tournamentApi.js`**  | **`useCreateTournamentMatchMutation`**, **`useGetTournamentMatchesQuery`**, tournaments/teams queries used by Start + public scorecard.                                                                                                                                                                                                                                                                                                                                                                              |
| **`api/enumApi.js`**        | **`useGetEnumsQuery`** — dismissals, extras, shot positions, overs, players-per-side.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **`slices/commonSlice.js`** | **`openDialog`** / **`closeDialog`** for `inningsEnd`.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **`selectors`**             | **`selectDialogKey`** (and related) consumed in `ScoringMatch.jsx`.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

---

## 6. Components

### 6.1 `src/components/scorecard/`

| File                     | Role                                        |
| ------------------------ | ------------------------------------------- |
| **`ScorecardTabs.jsx`**  | Tab shell styling/helpers for scorecard UIs |
| **`MatchCard.jsx`**      | Match list card                             |
| **`CommentaryText.jsx`** | Commentary line rendering                   |

### 6.2 `src/components/scoring/`

| File                              | Role                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| **`ScoringPlayerPickerMeta.jsx`** | **`ScoringPlayerPickerMeta`** — batting/bowling/fielder meta rows inside picker dialogs |

---

## 7. Organizer scoring — all files (`src/pages/organizer/scoring/`)

| Path                                  | Role                                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **`StartMatch.jsx`**                  | Create fixture / start scoring + toss; dialogs: Overs, PlayersPerSide, TeamSelect, Toss              |
| **`ScoringMatch.jsx`**                | Load match, sync, tabs, toss `Dialog`, API ball sync/undo, innings end → Redux dialog, result banner |
| **`ShotAreaDialog.jsx`**              | Shot picker + **`ShotDirectionStats`** export                                                        |
| **`MatchStatsRow.jsx`**               | Chase row / header stats (`SecondInningsChaseRow`, etc.)                                             |
| **`scoring-tabs/index.js`**           | Re-exports tabs                                                                                      |
| **`scoring-tabs/ScoringTab.jsx`**     | Main keypad, engine, all scoring dialogs, innings-end detection, squad save                          |
| **`scoring-tabs/ScorecardTab.jsx`**   | Organizer scorecard tab                                                                              |
| **`scoring-tabs/BallsTab.jsx`**       | Ball-by-ball                                                                                         |
| **`scoring-tabs/PartnershipTab.jsx`** | Partnerships                                                                                         |
| **`scoring-tabs/StatsTab.jsx`**       | Stats + shot direction wheel                                                                         |
| **`scoring-tabs/InfoTab.jsx`**        | Match metadata                                                                                       |

---

## 8. Public scorecard — all files (`src/pages/scorecard/`)

| Path                                                                                                                                                                               | Role                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **`index.js`**                                                                                                                                                                     | Barrel exports                                      |
| **`ScorecardHome.jsx`**                                                                                                                                                            | Tournament list                                     |
| **`ScorecardDetails.jsx`**                                                                                                                                                         | Single tournament tabs (schedule, table, squads, …) |
| **`ScorecardStatusDetails.jsx`**                                                                                                                                                   | Single match: live / result / upcoming              |
| **`StatsTotal.jsx`**                                                                                                                                                               | Tournament-wide stat totals page                    |
| **`statsTotalFlow.js`**                                                                                                                                                            | Routing helpers (see §4.9)                          |
| **`mockMatches.js`**, **`mockMatchDetails.js`**                                                                                                                                    | Mock / dev data (if used by UI)                     |
| **`tabs/index.js`**                                                                                                                                                                | Tab exports for details page                        |
| **`tabs/ScheduleTab.jsx`**, **`TableTab.jsx`**, **`TeamsTab.jsx`**, **`SquadsTab.jsx`**, **`SquadTeams.jsx`**, **`SquadSingle.jsx`**, **`StatsTab.jsx`**, **`PlaceholderTab.jsx`** | Tournament detail tabs                              |
| **`tabs/pointsTableData.js`**                                                                                                                                                      | Points table helpers/data                           |
| **`statusDetailsTabs/index.js`**                                                                                                                                                   | Status detail tab exports                           |
| **`statusDetailsTabs/LiveTab.jsx`**, **`ScorecardTab.jsx`**, **`OversTab.jsx`**, **`PlayingXITab.jsx`**, **`PlaceholderTab.jsx`**                                                  | Per-match tabs                                      |

---

## 9. Peripheral (name overlap — not core app scorecard)

These reference “score” in filenames but are **graphics / broadcast** UI, not the main scoring/scorecard module:

- `src/pages/graphics-controller/theme01/ScoreComparison.jsx`
- `src/pages/graphics-controller/theme01/ScoreComparisonBar.jsx`

---

## 10. End-to-end behaviour (short)

1. **Start** — `StartMatch.jsx`: enums → form → `createTournamentMatch` → optional `updateToss` → `/organizer/scoring/match/:id`.
2. **Load** — `ScoringMatch.jsx`: match, scorecard, both XIs, both squads (`matchApi` + `teamApi`).
3. **Hydrate** — `useApiMatchSync` + `scorecardInningsToBallHistory` + **`replayBallHistory`**.
4. **Score** — `ScoringTab` + `useScoringEngine`; each ball → `uiBallToStoreBallPayload` → `storeBall`; undo → `deleteBall` if `id`.
5. **Innings / match end** — `ScoringTab` detects end → `onInningsComplete` → **`InningsEndDialog`** via **`openDialog`**; after innings 1 dismiss → `handleInnings1Complete`; **`matchComplete`** from API/scorecard shows **`MatchResultBanner`** (`computeMatchResultSummary`).
6. **Public** — `ScorecardStatusDetails` + `scorecardUtils` + same `matchApi` reads.

---

## 11. Scenario checklist (implemented in app)

- [x] Fixture create without scoring
- [x] Create + toss + go to scoring
- [x] Toss later on `ScoringMatch` (inline dialog)
- [x] Hydrate from API (both innings, sorted balls, partnerships from API when present)
- [x] Legacy toss on completed matches (`getTossWinnerTeamId`)
- [x] Squad + playing XI POST per team
- [x] Runs, dot, 4/6, strike; WD/NB/bye/lb; wickets + fielder when required; custom runs; shot area
- [x] Extra runs dialog for extras types
- [x] Out reason + fielder picker flow
- [x] Squad picker for new batsman / bowler (two modes + replace striker / replace bowler)
- [x] End of over → change bowler dialog (suppressed when innings ends on that ball)
- [x] Undo + API delete
- [x] Innings 1/2 end + global innings/match-over dialog
- [x] Public tournament + match scorecard routes + stats total

---

## 12. Backend

Server validation, persistence, jobs (e.g. match completion, stats refresh) live in the **`api/`** repo — not duplicated here.
