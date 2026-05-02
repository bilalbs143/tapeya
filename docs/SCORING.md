# Organizer Scoring – API Integration & Use Cases

This document describes how the organizer scoring flow works, how it integrates with the API, and the use cases covered (including fielder for run out/catch/stumped).

## Overview

- **Entry points**
  - **`/organizer/scoring/match/:matchId`** (numeric id only) – Tournament match loaded from API. Scoring is API-only; match, scorecard, playing elevens, and team squads are fetched; balls are synced to the server. Invalid or non-numeric `matchId` (e.g. `/match/new`) redirects to start-match.

- **Data flow**
  - **Match config**: Teams, venue, date/time, overs, players per side, toss. For API matches this is built from `GET /matches/:id`, scorecard innings, and playing elevens.
  - **Ball history**: List of deliveries (runs, extras, wickets). For API matches it is loaded from `GET /matches/:id/scorecard` (innings[0].balls) and converted to UI shape; new balls are sent via `POST /matches/:id/innings/:inningsId/balls`.
  - **Undo**: Last ball is removed locally and, for API matches, `DELETE .../balls/:ballId` is called.

## API Endpoints Used

| Purpose                     | Method | Endpoint                                             |
| --------------------------- | ------ | ---------------------------------------------------- |
| Match detail                | GET    | `/matches/:matchId`                                  |
| Scorecard (innings + balls) | GET    | `/matches/:matchId/scorecard`                        |
| Playing eleven              | GET    | `/matches/:matchId/teams/:teamId/playing-eleven`     |
| Team squad (for names)      | GET    | `/teams/:teamId/squad`                               |
| Add ball                    | POST   | `/matches/:matchId/innings/:inningsId/balls`         |
| Update ball                 | PATCH  | `/matches/:matchId/innings/:inningsId/balls/:ballId` |
| Delete ball (undo)          | DELETE | `/matches/:matchId/innings/:inningsId/balls/:ballId` |
| Toss                        | PATCH  | `/matches/:matchId/toss`                             |
| Enums (dismissal, etc.)     | GET    | `/enums`                                             |

All require auth. Balls use integer user IDs for `striker_id`, `non_striker_id`, `bowler_id`, `out_player_id`, and `fielder_id`.

## Authorization (who may read / mutate scorecard)

- **Tournament organizer or pivot broadcast staff:** `GET …/scorecard`, `GET …/player-stats`, and ball mutations (`POST` / `PATCH` / `DELETE` …`/balls`) require the authenticated user to pass **`User::canScoreMatchInApp($match)`**, which is true when the user is the tournament **`organizer_id`**, is on the **`tournament_broadcaster`** pivot, or is a **platform administrator** (`type = administrator`) for break-glass support.
- **Other user routes** (toss, squads, etc.) still use **`canOperateTournamentInApp`** where wired — organizer or pivot staff only (no admin-type bypass on those unless separately added).
- **Audit trail:** successful **`store_ball`**, **`update_ball`**, and **`delete_ball`** actions append a row to **`match_scoring_audits`** (`tournament_match_id`, `user_id`, `action`, optional `ball_id`, optional `meta` JSON). This is not a full edit-lock or concurrent “lease” system; see `BROADCASTER_ROLE.md` §7 / §9 for remaining scoring hardening (lock, richer audit, etc.).

## Use Cases

### 1. Runs (0–6 and custom)

- User taps run button or custom score. A ball with `type: 'runs'` is appended; for API matches the same payload is sent with `storeBall`. Over and ball_in_over are derived from current ball history (only valid deliveries count; wides/no-balls do not advance the over).

### 2. Extras (WD, NB, Bye, Leg bye)

- Same as runs: local state update + `storeBall` when `isApiMatch`. Payload uses `is_wide`, `is_no_ball`, `is_bye`, `is_leg_bye` and runs as appropriate.

### 3. Wicket (Out) – dismissal type

- User taps OUT, then chooses a dismissal reason. Options come from **`/enums`** (`dismissal_type`); fielder required when option has `requires_fielder` (from API).
- Stored in ball: `type: 'out'`, `striker`, `bowlerId`, `dismissalType` (API value, e.g. `run_out`), and optionally `fielderId`.

### 4. Fielder for Caught / Run out / Stumped

- Backend requires **`fielder_id`** when `dismissal_type` is `caught`, `run_out`, or `stumped` (see `StoreBallRequest`).
- **UI**: When the user selects “Caught”, “Run out”, or “Stumped”, a **fielder picker** opens. The list is the **bowling team’s playing eleven** (fielding side). User selects the fielder; that `id` is stored as `fielderId` on the out ball and sent as `fielder_id` in the API payload.
- This ensures catch/run out/stumping stats are attributed to the correct player.

### 5. Shot direction (optional)

- When recording runs (1–6), user can open the shot-area dialog and select a zone. Stored as `shotDirection` and sent as `shot_position` (enum) if the backend supports it.

### 6. Undo

- Last ball is removed from local `ballHistory` and, for API matches, `deleteBall` is called with the ball’s API `id` (stored when the ball was created via `storeBall`).

### 7. Loading an existing match

- For `matchId` numeric: fetch match, scorecard, playing elevens (home + away), and team squads (for player names). Build UI match config and convert scorecard innings[0].balls to UI ball history. **Replay** ball history to derive current batsmen on crease, bowlers in table, striker index, current bowler index, and completed partnerships, so scoring can continue from the current state.

## Files

| File                          | Role                                                                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `matchConfig.js`              | API-only: `toSquadWithRole` for normalizing squad lists. No default config or mock data.                                                                       |
| `scoringMappers.js`           | API ↔ UI: dismissal options, `apiBallToUiBall`, `scorecardInningsToBallHistory`, `uiBallToStoreBallPayload`, `apiMatchToUiMatchConfig`, `buildPlayerIdToName`. |
| `scoringUtils.js`             | `getRunsFromBall`, `ballsToOvers`, `computeLiveScore` (valid deliveries for overs), `computePartnership`.                                                      |
| `scoringReplay.js`            | `replayBallHistory` – rebuilds batsmen/bowlers/partnerships from ball history when loading from API.                                                           |
| `ScoringMatch.jsx`            | Loads match/scorecard when `matchId` is numeric; provides `syncBallToApi` and `syncUndoToApi` to tabs.                                                         |
| `scoring-tabs/ScoringTab.jsx` | Live scoring: runs, extras, out (with dismissal + fielder picker), undo; calls sync when `isApiMatch`.                                                         |
| `store/api/matchApi.js`       | RTK Query endpoints: getMatch, getScorecard, getPlayingEleven, storeBall, updateBall, deleteBall, updateToss.                                                  |

## Dismissal and fielder flow (summary)

1. User taps **OUT** → Out reason modal opens with options from `dismissal_type` enum.
2. User taps **Caught** / **Run out** / **Stumped** → Fielder picker opens (bowling team players).
3. User taps a fielder → `handleOut(dismissalValue, fielderId)` runs: partnership/state updates, ball appended with `dismissalType` and `fielderId`, and for API matches `storeBall` is called with `fielder_id` set.
4. Other dismissals (Bowled, LBW, etc.) → No fielder; `handleOut(dismissalValue)` only.

## Overs and valid deliveries

- **Overs** are based on **valid deliveries** only (wd/nb do not count). So 6 valid balls = 1 over; wides and no-balls add runs but not to the over count. `computeOverAndBallInOver` and `computeLiveScore` use this for display and for building the next `storeBall` payload.

## Dynamic (API / enums) vs hardcoded

| Area                                      | Status                         | Source                                                                                                                                  |
| ----------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Dismissal types** (Out reason)          | Dynamic                        | `GET /enums` → `dismissal_type` (value, label, requires_fielder)                                                                        |
| **Extras** (WD, NB, BYE, LB)              | Dynamic                        | `GET /enums` → `extra_type` (value, label, short_label)                                                                                 |
| **Fielder required?**                     | Dynamic                        | From `dismissal_type[].requires_fielder` (no frontend constant)                                                                         |
| **Match / scorecard / balls**             | Dynamic when `matchId` numeric | `GET /matches/:id`, scorecard, playing eleven, squads                                                                                   |
| **Shot direction zones**                  | Dynamic                        | `GET /enums` → `shot_position`; `ShotAreaDialog` / `ShotDirectionStats` use `getShotPositionOptions`; geometry (paths) keyed by zone id |
| **Start Match** (overs, players per side) | Dynamic                        | `GET /enums` → `match_overs`, `players_per_side`; form options from API                                                                 |
| **Default maxOvers (20)**                 | Fallback only                  | Used when match/config has no overs; API match can provide overs from config                                                            |
| **Run buttons 0–6**                       | Fixed                          | Standard runs; no enum needed                                                                                                           |
| **OUT / Undo**                            | Fixed actions                  | Dismissal options are enum-driven; OUT/Undo are single actions                                                                          |
