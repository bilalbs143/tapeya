# Scoring & Graphics Architecture — Full Technical Analysis

> **Purpose:** Source-of-truth reference for the upcoming scoring/graphics refactor.  
> **Scope:** App (React/Capacitor), API (Laravel 13), Backoffice (Angular 21).  
> **Branch:** Based on `develop` branch including all uncommitted changes (2026-05-15).  
> **Status:** Pre-refactor analysis — describes the system as it exists today, not how it should be.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Responsibility Map](#2-responsibility-map)
3. [Data Models](#3-data-models)
4. [Match Lifecycle State Machine](#4-match-lifecycle-state-machine)
5. [Ball-by-Ball Scoring Flow](#5-ball-by-ball-scoring-flow)
6. [Extras — Detailed Rules](#6-extras--detailed-rules)
7. [Free Hit Mechanics](#7-free-hit-mechanics)
8. [Strike Rotation Logic](#8-strike-rotation-logic)
9. [Over Completion & Bowler Change](#9-over-completion--bowler-change)
10. [Wickets & Player Flow](#10-wickets--player-flow)
11. [Innings Transition](#11-innings-transition)
12. [Match Completion](#12-match-completion)
13. [Undo Mechanism](#13-undo-mechanism)
14. [Innings Hydration (Page Reload)](#14-innings-hydration-page-reload)
15. [Partnership Tracking](#15-partnership-tracking)
16. [Server-Side Stats: InningsStatsService](#16-server-side-stats-inningsstatsservice)
17. [Graphics System Architecture](#17-graphics-system-architecture)
18. [Graphic Commands vs Captions](#18-graphic-commands-vs-captions)
19. [Live Context: BuildMatchGraphicContextService](#19-live-context-buildmatchgraphiccontextservice)
20. [Graphic Prop Mapping: buildGraphicProps.js](#20-graphic-prop-mapping-buildgraphicpropjs)
21. [Graphic Components (Theme1)](#21-graphic-components-theme1)
22. [Backoffice Match Controller](#22-backoffice-match-controller)
23. [Synchronization Patterns](#23-synchronization-patterns)
24. [Background Jobs](#24-background-jobs)
25. [Scorecard Viewer Architecture](#25-scorecard-viewer-architecture)
26. [Toss Flow](#26-toss-flow)
27. [Playing XI Flow](#27-playing-xi-flow)
28. [Man of the Match Flow](#28-man-of-the-match-flow)
29. [Current Weaknesses & Technical Debt](#29-current-weaknesses--technical-debt)
30. [Ownership Boundary Recommendations](#30-ownership-boundary-recommendations)

---

## 1. System Overview

Tapeya is a mobile-first cricket platform. Its scoring subsystem spans three separate codebases:

| Layer | Tech | Role |
|---|---|---|
| **App** (`/app`) | React 18 + Redux Toolkit + Capacitor | Organizer scores balls live; fans view scorecard |
| **API** (`/api`) | Laravel 13 + Reverb + Sanctum | Stores raw ball data; computes stats; broadcasts events |
| **Backoffice** (`/backoffice`) | Angular 21 + Material | Broadcast operator controls live graphics |

**Data flow at a glance:**

```
[App Organizer]
    │  POST /balls (fully-formed payload)
    ▼
[API] stores ball → dispatches jobs → broadcasts via Reverb
    │                                       │
    │ async stats refresh (3s delay)        │ immediate graphic sync
    ▼                                       ▼
[DB: player_match_* tables]       [Reverb WebSocket]
                                  public: match.{id}.graphics
                          ┌────────────────┼────────────────┐
                          ▼                ▼                ▼
                   [App Viewer]    [Backoffice]    [OBS Overlay]
                   (scorecard)    (match ctrl)     (live broadcast)
```

---

## 2. Responsibility Map

### 2.1 What the App owns exclusively

- All cricket scoring **rules and validation** before sending to API
- Strike rotation computation (odd runs, over completion)
- Over boundary detection (`isLastBallOfOver`)
- Innings-end detection (`wouldInningsEndAfterBall` / `checkInningsEnd`)
- Free hit state tracking (`pendingFreeHit`)
- Partnership calculation (runs, balls, snapshots on wicket)
- Full innings state reconstruction on page reload (`replayBallHistory`)
- Undo logic (reverse-applying all mutations)
- Batsman/bowler crease position management
- Maiden over detection (live)
- UI-to-API payload mapping (`uiBallToStoreBallPayload`)
- `buildBallListWithMetaAndOverSummaries` — BallsTab over summary data
- Graphic prop mapping (`buildGraphicProps.js`) — command key → component props

### 2.2 What the API owns exclusively

- Persistent storage of raw ball data
- Stats materialization (`RefreshMatchStatsJob`)
- Match completion evaluation (`MatchCompletionService`)
- Innings creation (on toss recording)
- Broadcasting events via Reverb (`MatchGraphicCommandActivated`)
- Graphic context enrichment (`BuildMatchGraphicContextService`)
- Career stats enrichment (`GraphicCareerEnricher`)
- Win probability estimation (`WinProbabilitySimilarSituationsService`)
- Tournament leaderboards (`MatchGraphicTournamentLeaderboardService`)
- Audit trail (`MatchScoringAudit`)
- Authentication & authorization
- Career/tournament stats aggregation (`PlayerStatsService`)
- Server-side innings stats (`InningsStatsService`) — single source of truth for scorecard API and overlay context

### 2.3 What the Backoffice owns exclusively

- Graphic command selection and dispatch
- Caption management (one per match)
- Signed URL generation for OBS/vMix
- Broadcast theme selection + color config
- Match controller UI (operator workflow)
- `pending_players` hints (via `setPendingPlayers`)
- Innings toggle (1st/2nd) affecting which data populates player cards
- `live-match-state` component (reads from session.context only)

### 2.4 Shared / Duplicated Concerns (problem areas)

| Concern | App | API | Backoffice |
|---|---|---|---|
| Strike rotation | ✅ Full logic | ✅ `InningsStatsService` | ❌ |
| Wicket counting | ✅ Local | ✅ `InningsStatsService` | ❌ |
| Legal delivery detection | ✅ `isLegalDelivery()` | ✅ `Ball::isLegalDelivery()` | ❌ |
| Extras breakdown | ✅ `computeLiveScore()` | ✅ `InningsStatsService` | ❌ |
| Innings-end logic | ✅ `checkInningsEnd()` | ✅ `MatchCompletionService` | ❌ |
| Partnership tracking | ✅ Live | ✅ Scorecard response | ❌ |
| Free hit validation | ✅ `useScoringEngine` | ✅ `StoreBallRequest` | ❌ |
| Maiden detection | ✅ `scoringReplay` (on over boundary) | ✅ `InningsStatsService` | ❌ |

> **Key problem:** The same cricket rules are implemented independently in JavaScript (app) and PHP (API). They can drift. The `InningsStatsService` was added in the develop branch as a step toward a PHP-side single source of truth, but the app still runs its own parallel implementation.

---

## 3. Data Models

### 3.1 Ball (database table: `balls`)

```
innings_id         — FK to innings
over               — 0-based over number
ball_in_over       — 1–7 (7 possible for no-ball with another delivery)
striker_id         — User on strike
non_striker_id     — User at non-striker end
bowler_id          — User bowling
runs               — Total runs from delivery (batting + extras)
runs_off_bat       — Runs attributed to striker only (batting average purposes)
is_no_ball         — boolean
is_wide            — boolean
is_leg_bye         — boolean
is_bye             — boolean
is_free_hit        — boolean (this delivery was a free hit)
penalty_runs       — 0–255 (Law 41.17 penalty)
is_wicket          — boolean
dismissal_type     — DismissalTypeEnum string
out_player_id      — FK: dismissed player (null = striker)
fielder_id         — FK: caught/stumped/run-out fielder
shot_position      — ShotPositionEnum
```

**Computed helpers on Ball model:**
- `isPenaltyOnlyAward()` — penalty_runs > 0 + no delivery flags + is_wicket=false + runs==0
- `isLegalDelivery()` — not wide, not no-ball, not penalty-only
- `isRetiredHurt()` — dismissal_type === 'retired_hurt'

### 3.2 Innings

```
match_id           — FK to TournamentMatch
innings_number     — 1 or 2
batting_team_id
bowling_team_id
status             — not_started | in_progress | completed
```

Balls are ordered by `(over ASC, ball_in_over ASC, id ASC)` in the Innings relationship.

### 3.3 TournamentMatch (scoring-relevant fields)

```
status                     — scheduled | toss_done | in_progress | completed | cancelled
overs                      — max overs per innings
players_per_side           — typically 11
toss_winner_team_id
chose_to_bat_or_bowl       — bat | bowl
winning_team_id
win_by_runs
win_by_wickets
player_of_match_user_id    — NEW (develop): FK to users, nullable, nullOnDelete
```

**Relations:** `playerOfMatch()` → BelongsTo User (NEW in develop)

### 3.4 MatchGraphicSession

```
match_id           — FK
graphic_theme_id   — FK
config             — JSON (theme color customizations: home_text, home_bg, away_text, away_bg, enable_images)
context            — JSON (last computed live context — see §19)
pending_players    — JSON { next_batter_id?, next_non_striker_id?, next_bowler_id? }  [NEW in develop]
active_command_id  — FK to last activated command
```

### 3.5 MatchGraphicCommand

```
session_id
command_type       — LOWER_THIRD | CHART | FULL_SCREEN | PLAYER_BATSMAN | etc.
command_key        — e.g. LT_DEFAULT, WORM, BATSMAN_MATCH_LT
payload            — JSON (command-specific overrides, enriched with career stats if player)
display_mode       — e.g. IN | OUT | HOLD
created_at         — write-once (no updated_at)
```

### 3.6 MatchGraphicCaption (single row per match)

```
session_id
title
description
```

### 3.7 UI Ball Shape (App-internal, `scoringMappers.js`)

```javascript
{
  type: 'runs' | 'wd' | 'nb' | 'bye' | 'lb' | 'out' | 'retired_hurt' | 'penalty',
  runs: number,
  penaltyRuns: number,
  dismissalType: string | null,
  fielderId: number | null,
  strikerId: number | null,
  nonStrikerId: number | null,
  bowlerId: number | null,
  isFreeHit: boolean,
  wasFreeHit: boolean,        // snapshot for undo
  shotDirection: string | null,
  id: number | null,          // set after API confirms
  // undo snapshots (only on relevant ball types):
  partnershipSnapshot: { runs, balls } | null,
  striker: { id, name, runs, balls, fours, sixes, partnerRunsAtStart, partnerBallsAtStart } | null,
}
```

### 3.8 Dismissal Types (DismissalTypeEnum)

All valid values:

`bowled`, `caught`, `stumped`, `lbw`, `run_out`, `mankad`, `retired`, `retired_hurt`, `hit_wicket`, `hit_ball_twice`, `timed_out`, `one_hand_one_bounce`, `obstructing_the_field`, `over_the_fence`

**Special rules:**
- `retired_hurt` → `is_wicket = false` (player may return; no wicket counted). Note: the API payload is sent with `is_wicket = true` but `dismissal_type = 'retired_hurt'` — the server identifies it by dismissal type and does not count it as a wicket.
- `retired` → `is_wicket = true` (permanent; wicket counted)
- `run_out`, `obstructing_the_field`, `hit_ball_twice` → bowler NOT credited with wicket
- `caught`, `run_out`, `stumped` → `fielder_id` required
- On free hit: only `run_out`, `obstructing_the_field`, `hit_ball_twice` are valid

---

## 4. Match Lifecycle State Machine

```
[scheduled]
    │ PATCH /matches/{id}/toss
    ▼
[toss_done]           ← both innings rows auto-created here
    │ POST first ball
    ▼
[in_progress]         ← MatchCompletionService transitions on first ball
    │
    │  (balls accumulate)
    │
    │  both innings completed by MatchCompletionService
    ▼
[completed]           ← winning_team_id, win_by_runs/wickets set
                         graphic command history CLEARED (dev branch)
                         player_of_match_user_id nulled if was set before
    │
    │  (can revert if balls deleted)
    ▼
[in_progress]         ← re-evaluates on any ball delete/update
                         player_of_match_user_id nulled on revert (dev branch)
```

All transitions driven by `MatchCompletionService::evaluate()` which runs after every `POST`, `PATCH`, or `DELETE` on balls.

**Cancelled** is a terminal state, set manually.

---

## 5. Ball-by-Ball Scoring Flow

### 5.1 Live scoring (organizer entering a delivery)

```
User interaction (button tap in ScoringControls)
    │
    ▼
useScoringEngine handler
  (handleRuns / handleSpecial / handleOut / handleRetiredHurt / handlePenaltyRuns)
    │
    ├─► appendBall(uiBall) — adds to ballHistory
    │       └─► syncBallToApi(uiBall) — async POST /matches/{id}/innings/{id}/balls
    │
    ├─► Update batsmenOnCrease (runs, balls, fours, sixes)
    ├─► Update bowlersInTable (runs, balls, wickets, maidens)
    ├─► Update currentPartnership (runs, balls)
    ├─► Compute strike rotation
    ├─► Detect over completion → open bowler dialog
    └─► Detect innings end → trigger onInningsComplete callback
```

### 5.2 API response handling

```
POST /matches/{id}/innings/{id}/balls
    │  returns: { id, dismissal_type_label, ... }
    ▼
App patches last ball in history with server-assigned id
    (used for undo DELETE call later)
```

### 5.3 Store ball payload (`uiBallToStoreBallPayload` in `scoringMappers.js`)

| UI type | `runs` | `runs_off_bat` | Extra flags |
|---|---|---|---|
| `runs` | user input | = runs | — |
| `wd` | max(1, input) | 0 | `is_wide=true` |
| `nb` | max(1, input) | runs − 1 | `is_no_ball=true` |
| `bye` | user input | 0 | `is_bye=true` |
| `lb` | user input | 0 | `is_leg_bye=true` |
| `out` | 0 (or runs before wicket) | runs_off_bat | `is_wicket=true` |
| `retired_hurt` | 0 | 0 | `is_wicket=true, dismissal_type='retired_hurt'` |
| `penalty` | 0 | 0 | `penalty_runs=5` |

### 5.4 API side effects on POST/PATCH/DELETE /balls (in order)

1. Ball row created/updated/deleted
2. `MatchScoringAudit` row created (action: `store_ball` / `update_ball` / `delete_ball`)
3. Innings `status` → `in_progress` (store only, if not already)
4. `clearGraphicPendingCreaseIds()` — clears `next_batter_id` + `next_non_striker_id` from `pending_players` JSON
5. `MatchCompletionService::evaluate()` — may complete innings/match, clears graphic history on completion
6. `RefreshMatchStatsJob::dispatch()` — 3-second delay, recomputes all materialized stats
7. `SyncMatchGraphicContextJob::dispatch()` — immediate, unique-per-match, rebuilds live context + re-broadcasts

### 5.5 Ball validation (StoreBallRequest / UpdateBallRequest)

- `over`: required integer, min:0
- `ball_in_over`: required integer, min:1, max:7
- `striker_id`, `non_striker_id`: required, must differ, must exist in users
- `bowler_id`: required, must exist
- `runs`, `runs_off_bat`: required integers, min:0, max:255
- `penalty_runs`: optional integer, min:0, max:255
- `is_free_hit + is_wicket` combination: only `run_out`, `obstructing_the_field`, `hit_ball_twice` allowed as dismissal_type on free-hit balls

---

## 6. Extras — Detailed Rules

### 6.1 Wide (WD)

| Attribute | Value |
|---|---|
| Legal delivery? | **No** — does not advance over counter |
| Striker ball count | No change |
| runs_off_bat | Always 0 |
| Minimum runs | 1 (penalty) |
| Free hit trigger | No (but carries forward if one was pending) |
| Strike rotation | Never |
| Partnership balls | No increment |
| Partnership runs | Yes (all runs) |
| Bowler charged | Yes (all runs) |

### 6.2 No-Ball (NB)

| Attribute | Value |
|---|---|
| Legal delivery? | **No** — does not advance over counter |
| Striker ball count | **Yes** (ICC: batter faced it) |
| runs_off_bat | total_runs − 1 |
| Minimum runs | 1 (penalty) |
| Free hit trigger | **Always yes** — next delivery is free hit |
| Fours/sixes? | Yes, if off-bat runs = 4 or 6 |
| Strike rotation | Only if off-bat runs are odd |
| Partnership balls | Yes (1) |
| Bowler charged | Yes (all runs) |

### 6.3 Bye (B)

| Attribute | Value |
|---|---|
| Legal delivery? | **Yes** |
| Striker ball count | Yes |
| runs_off_bat | 0 |
| Batting stats impact | None |
| Free hit trigger | No |
| Strike rotation | Odd runs rotate |
| Partnership balls | Yes |
| Bowler charged | **No** |

### 6.4 Leg-Bye (LB)

Identical to Bye in all respects.

### 6.5 Penalty Runs (Law 41.17)

| Attribute | Value |
|---|---|
| Is a delivery? | **No** |
| Amount | Always 5 |
| Over counter | None |
| Striker ball count | No |
| Strike rotation | Never |
| Partnership runs | Yes (+5) |
| Partnership balls | No |
| Bowler charged | Yes (+5 to figures) |
| Dismissal possible? | No |
| Free hit state | Unchanged |

### 6.6 Extras breakdown computation (client + server)

```
extras = wides + noBalls + byes + legByes + penaltyRuns
// wide:    ball.runs (full amount)
// noBall:  ball.runs (full amount)
// bye:     ball.runs
// legBye:  ball.runs
// penalty: ball.penaltyRuns (separate column)
```

**Partnership exclusion:** The API (`PlayerStatsService::partnershipsForInnings`) excludes `penalty_runs` from partnership totals. The client app includes penalty runs in partnership. This is a known divergence.

---

## 7. Free Hit Mechanics

### 7.1 When it is set

Every no-ball sets `pendingFreeHit = true` for the NEXT delivery.

### 7.2 Carry-over rule (Law 21.18)

- Wide after free hit → free hit carries forward (not consumed)
- No-ball after free hit → free hit carries forward AND new free hit set
- Any legal delivery (runs, bye, lb, out, retired_hurt) → free hit consumed

### 7.3 Valid dismissals on free hit

Only: `run_out`, `obstructing_the_field`, `hit_ball_twice`

Enforced at:
- **App:** `getFreeHitDismissalOptions()` filters UI list; `useScoringEngine` warns on violation
- **API:** `StoreBallRequest` / `UpdateBallRequest` reject invalid dismissals server-side

### 7.4 Storage per ball

- `isFreeHit` — was this delivery a free hit?
- `wasFreeHit` — `pendingFreeHit` state BEFORE this ball (for undo)

`nextPendingFreeHit(ballType, currentPendingFreeHit)` computes post-ball state.

### 7.5 Known gap

The API validates free-hit dismissal types correctly, but **does not independently verify** that a ball marked `is_free_hit=false` should have been a free hit. A client bug could send `is_free_hit=false` on a delivery that should be a free hit, and the server silently accepts it.

---

## 8. Strike Rotation Logic

### 8.1 Rules table

| Scenario | Rotate? |
|---|---|
| Odd batting runs (1, 3, 5) | Yes |
| Even batting runs (0, 2, 4, 6) | No |
| Odd legal byes / leg-byes | Yes |
| Even legal byes / leg-byes | No |
| Wide (any runs) | **Never** |
| No-ball with odd off-bat runs | Yes |
| No-ball with even off-bat runs | No |
| Penalty only | **Never** |
| Wicket | Striker out; new batter becomes striker |
| Over completion (6th legal ball) | Yes **unless** odd-run rotation already happened on that ball |

### 8.2 Over-end rotation (double-flip prevention)

```javascript
const oddStrikeThisBall = causesStrikeRotation(runs);
// rotate for odd runs first:
if (oddStrikeThisBall) setStrikerIndex((i) => 1 - i);
// then at over boundary, only rotate if we didn't already:
if (overDone && !oddStrikeThisBall) setStrikerIndex((i) => 1 - i);
```

### 8.3 State representation

```javascript
batsmenOnCrease: [batter0, batter1]   // max 2
strikerIndex: 0 | 1
// striker    = batsmenOnCrease[strikerIndex]
// nonStriker = batsmenOnCrease[1 - strikerIndex]
```

### 8.4 Server-side strike resolution (`InningsStatsService::resolveCreaseAfterBalls`)

The API walks all balls and computes who is striker/non-striker after each delivery using the same rotation rules. This is used by:
- `ScorecardController::formatInnings()` — to reconcile pending_players against computed crease
- `BuildMatchGraphicContextService` — to populate batters in live context

---

## 9. Over Completion & Bowler Change

### 9.1 Detection

`isLastBallOfOver(ballHistory)` counts legal deliveries backward, returns `true` when the current delivery is the 6th.

### 9.2 On over completion

1. Strike rotation at end of over (§8.2)
2. If innings NOT ending: `setAddBowlerOpen(true)` — bowler picker opens automatically
3. If 2+ bowlers in table: `setCurrentBowlerIndex((i) => 1 - i)` — rotate
4. Selected bowler: `syncPendingToApi({ next_bowler_id })` — graphic session updated

### 9.3 Maiden detection

Live: on over boundary, if runs conceded in completed over == 0, `bowler.maidens++`.  
Server: `InningsStatsService` tracks legal-balls-per-over and detects maiden after 6th legal ball.

### 9.4 Known issue — bowler rotation assumes exactly 2

`setCurrentBowlerIndex((i) => 1 - i)` hardcodes a 2-bowler toggle. With 3+ bowlers tracked, the "current" bowler display becomes incorrect.

---

## 10. Wickets & Player Flow

### 10.1 Wicket handling sequence

```
User selects "Out"
    │
    ▼
OutReasonDialog — dismissalType selected
    │
    ├─ caught/stumped/run_out → FielderPickerDialog
    │
    ▼
handleOut(dismissalType, fielderId)
    ├─ appendBall (type: 'out', wasFreeHit snapshot)
    ├─ Bowler: +wickets (if credited), +balls
    ├─ Store partnershipSnapshot on ball (for undo)
    ├─ Store striker snapshot on ball (for undo)
    ├─ Remove striker from batsmenOnCrease
    ├─ Snapshot completed partnership
    ├─ Reset currentPartnership
    ├─ Check innings end
    └─ If over done and not innings end → open bowler dialog
```

### 10.2 Batter replacement

After a wicket (or when crease has < 2 batters), `ScoringSquadPlayerPickerDialog` opens. Shows only playing XI players who:
- Haven't yet batted, OR
- Are in `retiredBatsmen` (may return)

On selection: `syncPendingToApi({ next_batter_id })`.

### 10.3 Retired Hurt (NOT a wicket)

```
handleRetiredHurt()
    ├─ appendBall (type: 'retired_hurt')
    │     API payload: is_wicket=true, dismissal_type='retired_hurt'  ← semantic inconsistency
    ├─ Move striker → retiredBatsmen array (separate from crease)
    ├─ Snapshot completed partnership
    ├─ Reset currentPartnership
    └─ bowler: +penaltyRuns if any (rare)
```

Wicket count: **not incremented** (by either app or API).  
Player can return: `retiredBatsmen` array preserved; organizer can re-add them.

### 10.4 All-out detection

```javascript
totalWickets >= (playersPerSide - 1)
// e.g. 11-a-side: 10 wickets = all out
// retired_hurt does NOT count
```

### 10.5 Bowler credit rules

| Dismissal Type | Bowler Gets Wicket? |
|---|---|
| bowled, caught, lbw, stumped, hit_wicket, mankad, timed_out, one_hand_one_bounce | Yes |
| run_out, obstructing_the_field, hit_ball_twice, over_the_fence | **No** |
| retired_hurt | **No** (not a wicket) |
| retired | No (player chose to retire) |

### 10.6 Manual player edits

Not supported. Undo is the only correction mechanism. To fix a ball with the wrong player IDs, the organizer must undo all balls back to that point and re-enter.

---

## 11. Innings Transition

### 11.1 Trigger conditions (`checkInningsEnd` / `wouldInningsEndAfterBall`)

1. **All overs complete:** `validDeliveries >= maxOvers * 6`
2. **All out:** `totalWickets >= playersPerSide - 1`
3. **Target met (innings 2 only):** `totalRuns >= innings1Runs + 1`

### 11.2 Transition flow

```
ScoringTab detects innings end → calls onInningsComplete({ reason })
    │
    ▼
InningsEndDialog shown
    │  variant: 'first_innings_break'
    │  Shows reason description + "Continue when ready"
    ▼
handleInnings1Complete()
    ├─ Swap batting/bowling squads (batting ↔ bowling)
    ├─ Reset innings 2:
    │     batsmenOnCrease = [first 2 batters of new batting team]
    │     bowlersInTable  = [first bowler of new bowling team]
    │     ballHistory = []
    │     currentPartnership = { runs: 0, balls: 0 }
    │     completedPartnerships = []
    │     retiredBatsmen = []
    │     pendingFreeHit = false
    └─ setCurrentInnings('2')
```

### 11.3 Server-side innings completion

`MatchCompletionService` also marks innings completed after each ball. This happens independently of the client. There is a brief window where the client has transitioned to innings 2 but the server hasn't yet confirmed innings 1 is complete — however, because `MatchCompletionService::evaluate()` runs synchronously inside the ball storage request, innings 1 is marked complete on the server before the client can submit any innings 2 ball in practice.

### 11.4 Innings detection on hydration

`useApiMatchSync` sets `currentInnings = '2'` if:
- `scorecard.innings[1]` has balls, OR
- `scorecard.innings[0].status === 'completed'`

---

## 12. Match Completion

### 12.1 Server-side (MatchCompletionService)

Called after every ball mutation:

1. Load both innings
2. **Innings 1 completion:** wickets >= maxWickets OR legal_deliveries >= maxOvers*6
3. **Innings 2 completion** (only if innings 1 complete): additionally checks `runs > innings1_runs`
4. **Winner determination** (only if both complete):
   - Innings 2 wins: `win_by_wickets = maxWickets - innings2_wickets`
   - Innings 1 wins: `win_by_runs = innings1_runs - innings2_runs`
   - Tie: `winning_team_id = null`
5. Match `status = 'completed'`
6. **NEW (develop):** `GraphicCommandHistoryService::clearForMatchIfSessionExists()` — clears all graphic commands + resets `active_command_id`
7. **NEW (develop):** Nulls `player_of_match_user_id` if status reverts back to `in_progress` (ball deletion reverts completion)

### 12.2 Match completion reverts

If balls are deleted after completion, `MatchCompletionService` re-evaluates and reverts match back to `in_progress` if either innings becomes incomplete. This can cause unexpected state for broadcast operators (active graphic wiped when match completes, but completion reverts if scorer undoes).

---

## 13. Undo Mechanism

### 13.1 What is stored per ball for undo

| Field | Purpose |
|---|---|
| `wasFreeHit` | `pendingFreeHit` state BEFORE this ball |
| `partnershipSnapshot` | Partnership `{ runs, balls }` before ball (out/retired_hurt only) |
| `striker` | Full batsman snapshot at dismissal (out only) |
| `id` | Server ball ID for `DELETE /balls/:id` |

### 13.2 Undo reversal by ball type

| Type | Reversal |
|---|---|
| `runs` | striker: −runs/−balls/∓4s/6s; bowler: −runs/−balls; partnership: −runs/−balls; un-rotate if odd; restore bowlerIndex |
| `out` | restore dismissed batter to crease at striker position; bowler: −wickets/−balls; restore partnershipSnapshot; remove completed partnership entry |
| `retired_hurt` | return batter from retiredBatsmen to crease; restore partnershipSnapshot; remove completed partnership |
| `penalty` | partnership: −5 runs; restore bowlerIndex |
| `wd` | bowler: −runs; partnership: −runs; restore bowlerIndex |
| `nb` | bowler: −runs; striker: −balls; partnership: −runs/−balls; restore bowlerIndex |
| `bye` | bowler: −balls; partnership: −runs/−balls; un-rotate if odd; restore bowlerIndex |
| `lb` | same as bye |

**All types:** `setPendingFreeHit(last.wasFreeHit ?? false)`.

### 13.3 API undo call

`DELETE /matches/{id}/innings/{id}/balls/{ballId}` — triggers full server-side re-evaluation.  
If ball has no `id` (not yet persisted), API call is skipped.

---

## 14. Innings Hydration (Page Reload)

### 14.1 Full sequence (`useApiMatchSync.js`)

```
ScoringMatch mounts
    │
    ├─ useGetMatchQuery(matchId)
    ├─ useGetScorecardQuery(matchId)
    ├─ useGetPlayingElevenQuery(matchId, homeTeamId)
    └─ useGetPlayingElevenQuery(matchId, awayTeamId)
    │
    ▼ all data loaded + squads/playingElevens present
useApiMatchSync effect runs
    │
    ├─ buildRoleSquad(squadList, playingIds) for each team
    ├─ getBattingBowlingTeamIds(apiMatch, scorecard) — handles legacy toss
    ├─ For each innings in scorecard:
    │     ├─ apiBallToUiBall() — convert each ball to UI shape
    │     ├─ Sort balls by (over ASC, ball_in_over ASC)  ← API returns unsorted
    │     └─ replayBallHistory(uiBalls, battingPlayers, bowlingPlayers)
    │
    ├─ If scorecard has partnerships with wicket_number → prefer those
    │   Else → use partnerships from replay
    │
    ├─ innings1.reset({ ...reconstructedState })   — atomic batch
    ├─ innings2.reset({ ...reconstructedState })   — atomic batch
    │
    ├─ if innings2.balls.length > 0 OR innings1.status === 'completed'
    │     → setCurrentInnings('2')
    │
    └─ if no balls: initialize with 2 blank batsmen + 1 blank bowler
```

### 14.2 Legacy toss handling

For completed matches without `toss_winner_team_id` (older records), infers from:
- `scorecard.innings[0].batting_team_id` + `apiMatch.chose_to_bat_or_bowl`

### 14.3 What `replayBallHistory` reconstructs

- `batsmenOnCrease` — 1 or 2 active batsmen with running stats
- `strikerIndex` — who is currently on strike
- `bowlersInTable` — all bowlers seen (with stats: overs, balls, maidens, runs, wickets)
- `currentBowlerIndex` — who bowled the last over
- `completedPartnerships` — snapshots from wicket/retired_hurt events
- `currentPartnership` — live `{ runs, balls }`
- `pendingFreeHit` — whether next ball is a free hit
- `retiredBatsmen` — retired hurt list (may return)

### 14.4 Sort dependency

API does not guarantee ball ordering. App sorts by `(over, ball_in_over)` before replay. Corrupted or duplicate over numbering will produce incorrect replay state.

---

## 15. Partnership Tracking

### 15.1 Live state (app)

```javascript
currentPartnership = { runs, balls }
// All runs scored since last batter change (including extras, penalty)
```

### 15.2 Individual batter contribution within partnership

Each batsman carries `partnerRunsAtStart` / `partnerBallsAtStart` — innings totals when they arrived. Individual contribution:
```
batsman.runs − partnerRunsAtStart
batsman.balls − partnerBallsAtStart
```

### 15.3 Completed partnerships

```javascript
{
  id: string (uuid),
  batter1: { name, runs?, balls? },
  batter2: { name, runs?, balls? },
  runs, balls,
  retiredHurt?: boolean
}
```

### 15.4 API partnerships

Scorecard response includes `partnerships` array with `wicket_number` (null = ongoing). App uses API partnerships for completed ones (wicket_number != null), replay for ongoing.

### 15.5 Divergence

- App includes `penalty_runs` in partnership totals
- API (`PlayerStatsService::partnershipsForInnings`) excludes `penalty_runs`
- Both compute "current partnership" independently; no guarantee they match exactly

---

## 16. Server-Side Stats: InningsStatsService

**New in develop branch.** This is the single source of truth for PHP-side innings statistics.

### 16.1 Purpose

`InningsStatsService` centralizes all innings computation used by both:
- `ScorecardController::scorecard()` — the scorecard API
- `BuildMatchGraphicContextService` — the live overlay context

### 16.2 Key methods

**`compute(innings)`** — walks all balls and returns:

```php
[
  'batting_by_id'     => [...],  // per-player batting stats
  'bowling_by_id'     => [...],  // per-player bowling stats
  'dismissed_ids'     => [...],
  'current_striker_id' => int|null,
  'fall_of_wickets'   => [...],
  'total_runs'        => int,
  'total_wickets'     => int,
  'legal_balls'       => int,
  'extras_breakdown'  => ['wides', 'no_balls', 'byes', 'leg_byes', 'penalty_runs'],
]
```

**`resolveCreaseAfterBalls(balls)`** — walks balls and returns `{ striker_id, non_striker_id }` after all rotations.

Used by `ScorecardController::formatInnings()` to reconcile computed crease against `pending_players` JSON.

**`strikerRunsOffBat(balls, batsman_id)`** — sums `runs_off_bat` for a specific batsman across all balls where they were striker.

### 16.3 Crease reconciliation in formatInnings

After each ball, `ScorecardController::clearGraphicPendingCreaseIds()` clears `next_batter_id` + `next_non_striker_id` from `pending_players`. Then `formatInnings` calls `resolveCreaseAfterBalls` to get the server-computed crease, and includes `current_striker_id` in the innings response so the app can identify who is on strike.

---

## 17. Graphics System Architecture

### 17.1 Architecture overview

```
[Backoffice Operator]
    │ Selects command → POST /admin/.../graphic-session/commands
    ▼
[API — MatchGraphicSessionController::storeCommand()]
    ├─ Optionally enriches payload (career stats via GraphicCareerEnricher)
    ├─ Creates MatchGraphicCommand row (write-once)
    ├─ Sets active_command_id on session (if activate=true)
    └─ Fires MatchGraphicCommandActivated event
         │
         ▼
    [Reverb WebSocket]
    public channel: match.{matchId}.graphics
         │
         ├─────────────────────────────────────────┐
         ▼                                         ▼
[OBS/vMix Overlay]                         [Backoffice]
/overlay/:matchId                          receives .graphics event
(signed URL, no auth)                      patches local session copy
    │
    ▼
GraphicOverlay.jsx
→ graphicRegistry maps commandKey → component file
→ buildGraphicProps() maps session.context + payload → component props
→ Lazy-loaded component renders
```

### 17.2 Automatic re-broadcast (after every ball)

```
POST/PATCH/DELETE /balls
    │
    ▼
SyncMatchGraphicContextJob (immediate, unique-per-match via ShouldBeUnique)
    │
    ├─ BuildMatchGraphicContextService::syncAndBroadcast()
    │     ├─ Reads live data from DB (balls, players, stats)
    │     ├─ Computes full context via InningsStatsService
    │     ├─ Saves session.context
    │     └─ If active_command_id exists:
    │            fires MatchGraphicCommandActivated with fresh context
```

**ShouldBeUnique:** if multiple balls arrive rapidly, only one context rebuild runs — prevents thrashing.

### 17.3 Channel types

| Channel | Auth | Subscribers |
|---|---|---|
| `match.{matchId}.graphics` | **Public** | OBS overlay, Backoffice |
| `App.Models.User.{userId}` | **Private** (user token) | App (notifications, orders) |

### 17.4 Overlay authentication

Signed URL for OBS/vMix (no login required):
```
/overlay/{matchId}?theme=tapeya-basic&expires={unix_ts}&signature={hmac_sha256}
```

HMAC-SHA256: `hash_hmac('sha256', matchId|expires, secret)`. 24-hour TTL. Clock-skew tolerance: 120s.

Generated via backoffice: `GET /admin/matches/{id}/graphic-session/signed-url?theme=slug`.

The computed `overlayUrl` signal in the controller-settings dialog appends the currently-selected theme slug as a query param, so the URL updates live as the operator selects a different theme.

---

## 18. Graphic Commands vs Captions

### 18.1 Commands

Write-once (`MatchGraphicCommand`). 120+ types across 11 categories:

| Category | Example Keys |
|---|---|
| LOWER_THIRD | LT_DEFAULT, MINI_SCORECARD, RUN_RATE, CURRENT_PARTNERSHIP, LAST_WICKET, THIS_OVER, PREVIOUS_OVER, AT_STAGE, WIN_PREDICTION, NEED_TARGET, OUT, WIDE, NO_BALL, FIFTY_UP, HUNDRED_UP, REPLAY |
| TOURNAMENT | POINT_TABLE, SELECT_DRAW, HIGHEST_RUNS, HIGHEST_WICKETS, HIGHEST_FOURS, HIGHEST_SIXES |
| CHART | WORM, RUN_RATE_CHART, MANHATTAN |
| FULL_SCREEN | SCORECARD_FULL, THIS_MATCH, PLAYING_11, PLAYING_ELEVEN_HOME/AWAY, BATTING_SUMMARY, BOWLING_SUMMARY, MOM |
| PLAYER_BATSMAN | BATSMAN_NAME_LT/FS, BATSMAN_MATCH_LT/FS, BATSMAN_TOURNAMENT_LT/FS |
| PLAYER_BOWLER | BOWLER_NAME_LT/FS, BOWLER_MATCH_LT/FS, BOWLER_TOURNAMENT_LT/FS |
| TOUR_HITS | TOUR_RUNS, TOUR_WICKETS, TOUR_FOURS, TOUR_SIXES, TOUR_FIFTIES, TOUR_HUNDREDS |
| TRANSITION | FOUR, SIX, WICKET, FIFTY, HUNDRED, REPLAY |
| FULL_SCREEN_TRANSITION | FST_FOUR, FST_SIX, FST_OUT, FST_NOT_OUT, FST_WIDE, FST_NO_BALL, FST_FIFTY, FST_HUNDRED, FST_REPLAY, FST_DECISION |
| BREAK | INNINGS_BREAK, DRINKS, TEA_BREAK, LUNCH_BREAK, RAIN, RAIN_STOPPED, STRATEGIC_TIMEOUT |
| CAPTION | CUSTOM, ADD_CAPTION |

`LT_EMPTY` → clears overlay (no component rendered). `ADD_CAPTION` is backoffice-only and never sent to overlay.

**Career stats enrichment:** For `BATSMAN_TOURNAMENT_*` and `BOWLER_TOURNAMENT_*` commands, `GraphicCareerEnricher` fetches all-time career stats from `PlayerStatsService` and merges them into the payload at command creation time.

### 18.2 Captions

Single `MatchGraphicCaption` per match (upserted, not history). Static text: `title` + `description`. CUSTOM command embeds caption in payload at send time. Edit/delete fires `MatchGraphicCaptionChanged` broadcast — backoffice tabs sync.

**Weakness:** Captions are not versioned. Historical CUSTOM commands in command history embed the caption payload at send time, but the caption table itself has no history.

---

## 19. Live Context: BuildMatchGraphicContextService

**New in develop branch.** Replaces ad-hoc context assembly with a single centralized service.

### 19.1 Key methods

| Method | Purpose |
|---|---|
| `build($session)` | Compute full context array (no persist, no broadcast) |
| `syncAndBroadcast($session)` | Build → persist to `session.context` → re-broadcast active command |
| `setPendingAndBroadcast($session, $patch)` | Merge pending_players patch → persist → sync & broadcast |
| `syncForMatch($match)` | Find session → syncAndBroadcast |
| `mergeSessionContext($session)` | Merge DB-persisted context with fresh live data (used in resource) |

### 19.2 Full context payload structure

```json
{
  "match": { "status", "winning_team", "result_summary", "teams", "venue", "is_completed" },
  "tournament": { "name", "logo_url" },
  "home_team": { "name", "shortCode", "logoUrl", "score", "overs" },
  "away_team": { "name", "shortCode", "logoUrl", "score", "overs" },
  "innings_number": 1,
  "batting_team": "home",
  "score": "42-3",
  "overs": "6.2",
  "batters": [
    { "id", "name", "runs", "balls", "fours", "sixes", "dots", "on_strike", "team_id" }
  ],
  "bowler": { "name", "figures", "overs", "user_id", "runs_conceded", "dots", "wickets", "economy" },
  "current_over_balls": ["4", "0", "W", "6"],
  "partnership": { "runs", "balls" },
  "current_rr": "6.2",

  "target": 187,
  "runs_to_win": 145,
  "balls_remaining": 72,
  "required_rr": "12.1",
  "win_probability": { "home": 35, "away": 65 },

  "fall_of_wickets": [{ "number": "1st", "score": "42" }],
  "previous_over": { "runs": 11 },
  "last_12_balls": { "dots", "fours", "sixes", "wickets", "runs" },
  "last_30_balls": { ... },
  "this_over": { ... },
  "at_stage_mirror": { ... },

  "innings_chart": [
    {
      "innings_number": 1,
      "batting_team": "home",
      "overs_breakdown": [
        { "over": 1, "runs": 8, "cumulative": 8, "wickets": 0, "run_rate": 8.0, "fours": 2, "sixes": 0 }
      ],
      "total_runs": 180, "total_wickets": 7, "fours": 12, "sixes": 4
    }
  ],

  "graphic_leaderboard_runs": [{ "rank": "01", "runs": 287, "name", "team", "image_url" }],
  "graphic_leaderboard_fours": [...],
  "graphic_leaderboard_sixes": [...],
  "graphic_leaderboard_wickets": [...]
}
```

### 19.3 Pending players injection

`session.pending_players` (`{ next_batter_id, next_non_striker_id, next_bowler_id }`) is merged into the `batters` / `bowler` sections when the innings has no balls yet. This allows the overlay to show player names before the first delivery. Cleared from crease fields automatically after each ball.

### 19.4 Current-over ball display format

Balls displayed as strings in `current_over_balls`:
- `"4"` = boundary four
- `"6"` = six
- `"W"` = wicket
- `"WD"` = wide
- `"NB"` = no-ball
- `"0"` = dot
- `"P5"` = penalty 5 (example)
- `"*"` suffix = free hit (e.g. `"4*"` = four on free hit)

### 19.5 At-stage mirror

For innings 2, `at_stage_mirror` contains innings 1 data at the same legal-ball depth. Used by the `AT_STAGE` graphic to show a side-by-side comparison.

### 19.6 Win probability (WinProbabilitySimilarSituationsService)

Estimates chase win % from historical "similar situations" in the same tournament:
- Buckets: runs_to_win, balls_remaining, wickets_in_hand
- 6+ exact matches → pure historical
- 1–5 matches → blend historical + heuristic
- 0 matches → pure heuristic (current RR vs required RR, wickets lost)

---

## 20. Graphic Prop Mapping: buildGraphicProps.js

**New in develop branch.** Single function that maps any command key + session context + payload to component-ready props.

### 20.1 Data flow

```
GraphicSession.context  (live match state)
    +
Command payload          (command-specific overrides, career stats, etc.)
    │
    ▼
buildGraphicProps(commandKey, session, payload)
    │
    ▼
Normalized props → spread into lazy-loaded React component
```

### 20.2 Prop resolution strategy

- Payload props **override** context values
- Fallback chain: `payload → context → computed/default`
- Example (TOSS_LT): `payload.decision` → derived from `context.match.toss_winner_side + chose_to_bat_or_bowl` → default

### 20.3 Key helpers inside buildGraphicProps

- `buildChartData(inningsChart, mode)` — converts `innings_chart` to ApexCharts series (modes: `cumulative` / `runs` / `run_rate`)
- `normalizeBatters()` — standardizes `on_strike` vs `onStrike` prop naming
- `scoreboardBase()` — extracts batting/bowling team + batters + bowler for ScoreboardLeft components
- `mergePlayerPropsFromSession()` — resolves player name from context.batters/bowler if payload lacks it
- `buildLeaderboardGraphicProps()` — routes `graphic_leaderboard_*` data to `featured` (top) + `rows` (list)

### 20.4 Debug logging

`graphicDebugLog.js` exports `graphicDebugLog(tag, payload)`. Activated by `localStorage.graphicDebug = '1'` or `import.meta.env.DEV`. Used within `buildGraphicProps` and `GraphicOverlay` to log command rendering.

---

## 21. Graphic Components (Theme1)

### 21.1 Registry (`graphicRegistry.js`)

Maps command keys → component filenames. Theme slug maps to folder: `'tapeya-basic'` → `'theme1'`. Components are lazy-loaded and cached (no duplicate lazy wrappers). Unknown keys return `null` (transparent).

### 21.2 Shared primitives (new in develop)

**`ScoreboardHeader.jsx`** — shared exports used by most live lower-thirds:
- `ScoreboardLeft` — team logo, code, overs, score, top 2 batters
- `BowlerBlock` — bowler name + figures + current-over ball chips
- `ScoreboardAtStageMirror` — innings 1 mirror for AT_STAGE
- `BatterNameLabel` — truncated name with gold `*` if on strike; accepts both `onStrike` and `on_strike`
- `FreeHitMicroBadge` — lightning bolt badge
- `ballChipClass(ball)` — Tailwind color classes by ball type (W=red, 4=green, 6=purple, WD/NB/LB/B=dark+gold border, 0=dark, other=gold)

**`playerGraphicTheme.js`** — design tokens for player graphic pages (background color `#1D1E22`, accent gold `#DA9811`, asset URLs, CSS classes)

**`PlayerShowcasePrimitives.jsx`** — reusable player card parts:
- `PlayerShowcasePage`, `PlayerShowcaseSection`, `PlayerAvatarStage`
- `PlayerVerticalStatList` — vertical stats with gradient separators
- `PlayerIdentityBlurb` — name + team + role card
- `PlayerIdentityFadeRule` — horizontal gradient divider

**`PlayerLowerThirdPanel.jsx`** — bottom panel for player stats:
- Props: `playerName`, `headerRight` (ReactNode), `stats` (`[{ label, value }]`)

**`TournamentLeaderboardPanel.jsx`** — full-screen leaderboard:
- Props: `title`, `subtitle`, `rows`, `featured`, `tournamentLogoUrl`, `metricKind`
- Shows `featured` player card (image + name + value) + ranked rows list

### 21.3 Component inventory by category

| Component | Command Keys | Renders |
|---|---|---|
| `StatsDefault` | `LT_DEFAULT` | Live scoreboard (batting left, bowling right) |
| `MatchSummary` | `MINI_SCORECARD` | Mini 3-column scorecard |
| `CricketMatchSummary` | `MATCH_SUMMARY` | Full-screen match stats card |
| `AtThisStage` | `AT_STAGE` | Innings 1 vs 2 comparison (optional mirror) |
| `CurrentPartnership` | `CURRENT_PARTNERSHIP`, `CURRENT_PARTNERSHIP_FS` | Partnership runs/balls |
| `FallofWickets` | `LAST_WICKET`, `LAST_WICKET_FS` | Scrollable wicket cards |
| `LastBalls` | `LAST_12_BALLS`, `LAST_30_BALLS`, `THIS_OVER`, `PREVIOUS_OVER` | Ball-window stats (dots/4s/6s/Ws/runs) |
| `TargetNeeded` | `NEED_TARGET`, `NEED_TARGET_FS`, `FDR` | Runs to win + balls |
| `RunRate` | `RUN_RATE` | CRR vs RRR with target badge |
| `WinPredictor` | `WIN_PREDICTION` | Win % home vs away |
| `InningsBreak` | `INNINGS_BREAK` | Break screen (team logos) |
| `TeaBreak` | `DRINKS`, `TEA_BREAK`, `LUNCH_BREAK`, `RAIN`, `RAIN_STOPPED`, `STRATEGIC_TIMEOUT` | Break (dynamic label) |
| `TournamentStart` | `THIS_MATCH`, `MATCH_INFO`, `SCORECARD_FULL`, `NEXT_MATCH` | Match start screen |
| `TournamentIntro` | `INTRO_LT` | Match intro (logos + "VS") |
| `TournamentOverview` | `TOURNAMENT_NAME`, `SELECT_DRAW`, `POINT_TABLE` | Tournament card |
| `TournamentOver` | `MATCH_SUMMARY_FS` | Final scores both teams |
| `ResultIntro` | `RESULT_LT` | Match result (winner/loser dim effect) |
| `Toss` | `TOSS_LT` | Toss decision text |
| `PlayingXI` | `PLAYING_11`, `PLAYING_ELEVEN_HOME`, `PLAYING_ELEVEN_AWAY` | Team lineups (`side`: both/home/away) |
| `PlayerIntro` | `BATSMAN_NAME_*`, `BOWLER_NAME_*`, `MOM` | Player intro (name, photo, team, role) |
| `BatsmanCurrentStats` | `BATSMAN_MATCH_*` | Live batsman in-match stats |
| `BatsmanCareerStats` | `BATSMAN_TOURNAMENT_*` | Batsman tournament/career stats |
| `BatsmanInningsStats` | `BATTING_SUMMARY`, `BATTING_SQUAD`, `INNING_FIGURES` | Full-screen innings stats |
| `BowlerCurrentStats` | `BOWLER_MATCH_*` | Live bowler in-match stats |
| `BowlerCareerStats` | `BOWLER_TOURNAMENT_*`, `BOWLING_SUMMARY`, `BOWLING_SQUAD` | Bowler career stats |
| `PlayerTournamentStats` | `TOUR_FOURS`, `TOUR_SIXES`, `TOUR_FIFTIES`, `TOUR_HUNDREDS`, `TOUR_RUNS`, `TOUR_WICKETS` | 3-col player milestone card |
| `ScoreComparison` | `WORM` | Line chart (cumulative runs) |
| `ScoreComparisonBar` | `MANHATTAN` | Bar chart (per-over runs) |
| `RunRateChart` | `RUN_RATE_CHART` | RPO trend line with par=6.0 reference |
| `HighestRuns` | `HIGHEST_RUNS`, `HIGHEST_SIXES`, `HIGHEST_FOURS`, `TOP_BATTER` | Batting leaderboard |
| `HighestWickets` | `HIGHEST_WICKETS`, `TOP_BOWLER` | Bowling leaderboard |

### 21.4 Color scheme

- Background: `#1D1E22`
- Accent/gold: `#DA9811`
- Text: white with secondary grays
- Separators: gradient (white @ 50% fading to transparent)
- Ball chips: W=red, 4=green, 6=purple, extras=dark+gold border, dot=dark, other=gold

### 21.5 Innings conditional in components

Only `AtThisStage` has explicit innings-1-vs-2 logic (`useMirror` boolean). All other components are innings-agnostic — they render whatever data arrives from context/payload.

---

## 22. Backoffice Match Controller

### 22.1 Component hierarchy

```
match-controller-dashboard.component
├── live-match-state.component (embedded)       [NEW in develop]
├── controller-settings-dialog.component (mat-dialog)
├── match-caption-dialog.component (mat-dialog)
└── Template: player cards + catalog grid
```

### 22.2 Data loaded on init (`loadAll` via forkJoin)

- `TournamentMatchesService.getById(matchId)` — match metadata
- `MatchGraphicService.getSession(matchId)` — session + active command + recent 30 commands
- `MatchGraphicService.listThemes()` — available graphic themes
- `MatchGraphicService.getCommandCatalog()` — 11 groups of 120+ command actions
- `MatchGraphicService.listCaptions(matchId)` — saved caption (0 or 1)
- `MatchGraphicService.getGraphicPlayerLists(matchId)` — home/away rosters + innings sides [NEW]

**First load:** auto-opens settings dialog to prompt theme selection + copy OBS URL.

### 22.3 Command dispatch cycle

```
User clicks action button
    │
    ├─ Special handling:
    │     ADD_CAPTION → opens caption dialog (not sent)
    │     CUSTOM → embeds saved caption title/description in payload
    │     PLAYING_11/* → buildPlayingElevenPayload() from roster
    │     PLAYER_* → uses live batters from context OR operator-selected pick
    │
    ▼
dispatchGraphicCommand()
    ├─ POST /admin/matches/{id}/graphic-session/commands
    │   { command_type, command_key, payload, display_mode, activate: true }
    │
    ├─ Optimistic update: session.active_command, prepend to recent_commands (max 30)
    └─ sendingKey cleared; button reveals label
```

### 22.4 Innings toggle (NEW in develop)

The backoffice has a 1st/2nd innings radio toggle. On change:
- `selectedInnings` updated (1 or 2)
- Player picks reset
- `updateSession({ context: { ...current, innings_number: v } })` (no broadcast)
- Future commands include `innings_number` in payload
- Player roster filtered by `innings_sides` data (batting vs bowling team per innings)

### 22.5 Live batters/bowler cards (NEW in develop)

The dashboard shows player cards derived from `session.context.batters` and `session.context.bowler`:
- **Striker card** — name, runs/balls stats, action buttons from `playerBatsmanGroup`
- **Non-striker card** — same structure
- **Bowler card** — name, figures (overs), action buttons from `playerBowlerGroup`
- Disabled if no player in context or action is in-flight
- `liveBowlerCommandPick()` — uses live bowler from context if found, else falls back to `selectedBowler`

### 22.6 Live match state component (NEW in develop)

`live-match-state.component` is a lightweight read-only display embedded in the dashboard:

**Input:** `context: Record<string, unknown> | null`

**Displays:**
- Label: "Live · 1st/2nd Innings · Batting Team short code"
- Score: "Runs/Wickets · Overs · CRR"
- Current over balls: colored chips (same color scheme as overlay)
  - `0` displayed as `•`
  - Free hit balls show a lightning badge

**Ball chip colors:** W=red, RH=gray, 4=green, 6=purple, WD/NB/LB/B=dark+gold border, 0=dark, default=gray. Free hit = gold ring overlay.

### 22.7 Reverb subscription

After load, `subscribeToGraphicsChannel()` joins public Reverb channel:
- `graphics_activated` event → patches `session.active_command` + `session.context` locally
- Caption update event → refreshes caption list
- Cleanup function unsubscribes on destroy

### 22.8 Settings dialog (updated in develop)

- **Theme selector** (dropdown)
- **Signed overlay URL** with:
  - Loading/error states (signals)
  - `overlayUrl` computed signal: auto-appends current theme slug as `?theme=` param
  - Copy button with clipboard feedback
  - Refresh button to regenerate signature
- **Team color pickers:** home/away text + background colors (HTML5 color inputs)
- **Enable images toggle**
- **Graphics URL template** (read-only from theme)

### 22.9 API endpoints (match graphic)

```
GET    /admin/graphic-command-catalog              — All command groups + actions
GET    /admin/graphic-themes                       — Theme list
GET    /admin/matches/{id}/graphic-session         — Get/create session
GET    /admin/matches/{id}/graphic-session/signed-url?theme=slug
PATCH  /admin/matches/{id}/graphic-session         — Update theme, config, context
PATCH  /admin/matches/{id}/graphic-session/pending-players
GET    /admin/matches/{id}/graphic-session/commands?page=&per_page=
POST   /admin/matches/{id}/graphic-session/commands
POST   /admin/matches/{id}/graphic-session/commands/{id}/activate
DELETE /admin/matches/{id}/graphic-session/commands
GET    /admin/matches/{id}/graphic-player-lists    — [NEW] home/away rosters + innings sides
GET/POST/PATCH/DELETE /admin/matches/{id}/graphic-session/captions[/{id}]
```

---

## 23. Synchronization Patterns

### 23.1 App → API (live scoring)

- **Mechanism:** HTTP POST/PATCH/DELETE (RTK Query mutations)
- **Pattern:** Optimistic local state update, then API confirm
- **Failure handling:** If API fails, app does NOT roll back local state (silent failure)
- **Race conditions:** Rapid ball entry can cause parallel in-flight requests; server processes in arrival order

### 23.2 API → Overlay (graphic updates)

- **Mechanism:** Reverb WebSocket, public channel push
- **Pattern:** After every ball, `SyncMatchGraphicContextJob` rebuilds context + re-broadcasts
- **Deduplication:** ShouldBeUnique — concurrent ball entries won't thrash
- **Failure:** If WebSocket disconnects, overlay freezes at last broadcast state

### 23.3 API → Backoffice

- **Mechanism:** Reverb WebSocket, same public channel
- **Pattern:** Backoffice receives same broadcast as overlay; patches local session copy
- **Failure:** Backoffice can manually call `loadAll()` to re-fetch

### 23.4 API → App Scorecard viewer

- **Mechanism:** RTK Query polling (no WebSocket)
- **Freshness:** Stats from `RefreshMatchStatsJob` (3s delay) — always 3+ seconds behind live scoring
- **Context mismatch:** Overlay updates immediately (reads from balls via `InningsStatsService`); viewer updates after job delay (reads from materialized `player_match_*` tables)

### 23.5 Pending players sync flow

```
Before first ball:
    App selects batsmen/bowler in UI
    → PATCH /matches/{id}/graphic-session/pending-players
      { next_batter_id, next_non_striker_id, next_bowler_id }
    → BuildMatchGraphicContextService::setPendingAndBroadcast()
    → overlay shows player names immediately

After each ball:
    ScorecardController::clearGraphicPendingCreaseIds()
    → clears next_batter_id + next_non_striker_id from pending_players
    → InningsStatsService::resolveCreaseAfterBalls() computes actual crease
```

---

## 24. Background Jobs

### 24.1 RefreshMatchStatsJob (3-second delay)

```
1. Walk all innings → all balls for the match
2. Delete old player_match_* rows
3. Compute + insert fresh player_match_batting, player_match_bowling, player_match_fielding
4. Recompute accumulative player_batting_stats, player_bowling_stats, player_fielding_stats
   (from all player_match_* in the tournament)
5. All in a DB transaction
```

### 24.2 SyncMatchGraphicContextJob (immediate, ShouldBeUnique)

```
1. Find MatchGraphicSession for match (skip if none)
2. BuildMatchGraphicContextService::syncAndBroadcast()
3. Updates session.context in DB
4. Re-broadcasts active command with fresh context
```

### 24.3 PurgeOldMatchGraphicCommands (scheduled console command) [NEW]

```
php artisan match-graphic:purge-old-commands [--hours=24]
Calls GraphicCommandHistoryService::deleteCommandsCreatedBefore()
```

Cleans up old command rows. If the active command is deleted, `active_command_id` is nulled.

---

## 25. Scorecard Viewer Architecture

### 25.1 Page hierarchy

```
ScorecardHome (all tournaments + matches)
    └─ ScorecardDetails (single tournament: fixtures, table, squads)
         └─ ScorecardStatusDetails (single match)
              ├─ Live tab      → batting/bowling tables, partnership
              ├─ Scorecard tab → full innings batting table
              ├─ Overs tab     → over-by-over summary
              └─ Playing XI tab
```

### 25.2 Data flow

```
getMatch + getScorecard + getPlayingEleven (×2)
    │
    ├─ apiTournamentMatchToStatusDetailsMatch()
    ├─ oversDetailsFromScorecard()
    └─ playingXIFromPlayingElevenResponses()
    │
    ▼
buildMatchStatusDetails() → single merged object → tabs
```

### 25.3 Scorecard API response shape (`GET /matches/{id}/scorecard`)

```json
{
  "innings": [
    {
      "id", "innings_number", "batting_team_id", "bowling_team_id",
      "batting_team": { "id", "name" },
      "bowling_team": { "id", "name" },
      "status",
      "total_runs", "total_wickets", "total_extras",
      "extras_breakdown": { "wides", "no_balls", "byes", "leg_byes", "penalty_runs" },
      "overs_display", "run_rate",
      "current_striker_id",
      "batting_stats": [
        { "id", "name", "runs", "balls", "dots", "fours", "sixes",
          "strike_rate", "dismissal_type", "dismissal_label",
          "bowler_name", "fielder_name", "is_on_crease", "is_retired_hurt" }
      ],
      "bowling_stats": [
        { "id", "name", "overs", "maidens", "runs", "wickets", "dots", "economy" }
      ],
      "fall_of_wickets": [
        { "wicket_number", "batsman_name", "score", "overs" }
      ],
      "partnerships": [
        { "player_1_id", "player_2_id", "runs", "balls", "wicket_number" }
      ],
      "balls": [
        { "id", "over", "ball_in_over",
          "striker_id", "non_striker_id", "bowler_id",
          "runs", "runs_off_bat",
          "is_no_ball", "is_wide", "is_leg_bye", "is_bye", "is_free_hit",
          "penalty_runs", "is_wicket", "dismissal_type", "dismissal_type_label",
          "out_player_id", "fielder_id", "shot_position" }
      ]
    }
  ]
}
```

### 25.4 Live tab vs server data

The "Live" tab reads from the scorecard API — **not** from the app's live scoring state. It shows materialized stats (refreshed 3s after each ball). The live scorer's UI is always ahead.

### 25.5 BallsTab (new in develop)

`buildBallListWithMetaAndOverSummaries(ballHistory)` in `scoringUtils.js` produces:

```javascript
{
  ballListWithMeta: [
    { ball, overBallLabel, validCount, overIndex }
  ],
  overSummaries: {
    [overIndex]: {
      balls, overRuns, cumulativeRuns, cumulativeWickets,
      creaseSnapshot, bowlerSnapshot
    }
  }
}
```

Used by `BallsTab` to render ball-by-ball chips with over summary cards:
- Ball chip shows: W / 4 / 6 / WD / NB / 0 / etc.
- Free-hit badge: gold ring + ⚡
- Penalty badge: P5 (red)
- Over summary after every 6 legal balls

---

## 26. Toss Flow

### 26.1 Steps

```
1. Match loaded with status='scheduled'
2. TossDialog shown — operator picks winner + bat/bowl
3. PATCH /matches/{id}/toss { winning_team_id, chose_to_bat_or_bowl }
4. API:
   a. winning_team_id, chose_to_bat_or_bowl set on match
   b. status → 'toss_done'
   c. Both innings rows created (if count == 0):
      toss winner chose BAT: innings1_batting=winner, innings1_bowling=other
      toss winner chose BOWL: innings1_batting=other, innings1_bowling=winner
      Innings 2 always reverses
5. App invalidates Match + Scorecard cache
6. useApiMatchSync initializes blank batsmen/bowler slots
```

### 26.2 Gap

After toss, the app initializes blank crease slots without requiring playing XI to be set first. The API accepts any valid user IDs as striker/bowler — it does not validate against the playing XI list.

---

## 27. Playing XI Flow

### 27.1 Squad vs Playing XI

- **Match Squad** — all players announced for the match. `POST /matches/{id}/teams/{id}/squad` (player_ids)
- **Playing XI** — final N players. `POST /matches/{id}/teams/{id}/playing-eleven` (player_ids). Replaces existing (delete + insert).

### 27.2 App flow

```
ScoringSquadPlayerPickerDialog (squad setup mode)
    Organizer toggles each player: "Playing" / "Bench"
    On submit: storePlayingEleven({ matchId, teamId, player_ids })
    → invalidates Match + Scorecard cache
    → subsequent pickers filter to XI only (if XI was saved)
```

### 27.3 Optional nature

Playing XI is not required before scoring. If not set, all squad members appear in pickers. The API validates only that player_ids are a subset of match squad (1 to `players_per_side`).

---

## 28. Man of the Match Flow

**New in develop branch.**

### 28.1 Flow

```
InningsEndDialog (variant: 'match_over')
    Shows match result + Man of Match picker
    Operator selects a player from playing XI
    → PATCH /matches/{id}/player-of-match { player_of_match_user_id }

API:
    1. Match must be COMPLETED status
    2. Player must be in match_players for home, away, or winning team
    3. Only tournament organizers may update
    4. Stores player_of_match_user_id on match row
```

### 28.2 Revert behavior

If match status reverts from `completed` to `in_progress` (ball deleted), `MatchCompletionService` nulls `player_of_match_user_id`. The POTM selection is lost.

### 28.3 Display

POTM is shown in the `MOM` graphic command. `buildGraphicProps` maps `MOM` → `PlayerIntro` component with player name/image from context.

---

## 29. Current Weaknesses & Technical Debt

### 29.1 Duplicated cricket logic (critical)

Same rules implemented in JavaScript (app) and PHP (`InningsStatsService`): legal delivery detection, strike rotation, wicket counting, extras breakdown, innings-end conditions, maiden detection.

The `InningsStatsService` (develop branch) is a step toward centralizing PHP-side logic, but the app still runs its own parallel implementation. A rule change must be applied in both places.

### 29.2 Client is the live scoring source of truth

The API stores only raw balls. If the app crashes mid-over, the only recovery is a page reload which replays from the API. Replay is correct but depends on sorted ball order that the API does not guarantee.

### 29.3 No ball editing UI

Undo-only correction. To fix ball #5 of over #3, the scorer must undo all subsequent balls, re-enter the correction, and re-enter all following balls. Destroys audit trail clarity for those re-entered balls.

### 29.4 Silent API failure on ball sync

If `syncBallToApi()` fails, the app continues as if the ball was accepted (no `id` assigned). On reload, the missing ball doesn't appear in hydration replay — state diverges. No retry or failure indicator in UI.

### 29.5 Bowler rotation assumes exactly 2 bowlers

`setCurrentBowlerIndex((i) => 1 - i)` hardcodes a 2-bowler toggle. With 3+ bowlers tracked in `bowlersInTable`, the displayed "current" bowler is wrong after over completion.

### 29.6 Pending players race condition

Setting pending players and submitting the first ball are two separate API calls. Ball submission clears crease pending fields. If both calls arrive simultaneously, the graphic context may briefly show empty/stale player info.

### 29.7 Stats lag (3-second delay)

Scorecard viewer is always 3+ seconds behind live. Overlay is immediate (reads directly from balls via `InningsStatsService`). This creates an inconsistency: the broadcast can show correct data that the in-app scorecard doesn't show yet.

### 29.8 `retired_hurt` semantic inconsistency in API payload

`retired_hurt` is sent with `is_wicket=true` in the wire payload, contradicting the semantic meaning (it's not a real wicket). The server correctly identifies it via `dismissal_type` and excludes it from wicket counts, but the field name is misleading for anyone reading the raw API.

### 29.9 Innings transition timing gap

The client transitions to innings 2 before the server confirms innings 1 is complete. In practice this works (server completes innings synchronously in the ball response), but it's an implicit timing dependency, not a guaranteed contract.

### 29.10 No WebSocket for scorecard viewer

Scorecard viewer polls. Live match fans wait for the next poll cycle for each new ball. The broadcast overlay has instant updates; the app viewer does not.

### 29.11 Graphic context built from DB (not real-time balls)

`SyncMatchGraphicContextJob` is dispatched immediately but processes asynchronously on the queue. There is a nonzero window between when a ball is stored and when the graphic context is rebuilt and broadcast. In a high-throughput queue, this window could be seconds.

### 29.12 Innings toggle in backoffice is manual

The operator must manually switch the innings toggle in the backoffice. If they forget, graphics for innings 2 are sent with `innings_number=1` in the payload. Most components are innings-agnostic (they use context data), but any component that explicitly reads `innings_number` from the payload will show incorrect data.

### 29.13 Partnership divergence (penalty runs)

App includes penalty runs in partnership totals. API excludes them. The displayed partnership in the live scoring UI and the partnership in the scorecard API response may differ if penalty runs were awarded.

### 29.14 Free hit tracking is fully client-trusted

The API validates dismissal types on free-hit balls, but does not independently verify whether a ball should have been a free hit. A client bug sending `is_free_hit=false` when it should be `true` is silently accepted.

### 29.15 Over/ball_in_over not validated for continuity

The API accepts `over` and `ball_in_over` as submitted by the client. It doesn't verify continuity (that over 3 ball 4 follows over 3 ball 3). Corrupted numbering corrupts replay and scorecard sort order.

### 29.16 Graphic command history cleared on match completion

When a match completes, `MatchCompletionService` clears all graphic command history and resets `active_command_id`. If the match then reverts to `in_progress` (ball deleted), the graphic history is gone and the overlay goes blank. The operator must re-send commands.

### 29.17 POTM is nulled on match status revert

If the scorer undoes a ball that caused match completion, `player_of_match_user_id` is nulled automatically. The POTM selection is lost with no warning to the operator.

### 29.18 No innings-specific graphic command validation

The API accepts any `command_key` in any context. Sending a `BATSMAN_TOURNAMENT_FS` command without selecting a player will send a command with an empty payload — the overlay will render with no player data and no error.

---

## 30. Ownership Boundary Recommendations

### 30.1 API should be the single source of truth for cricket rules

**Currently:** Rules duplicated in JS + PHP.  
**Recommendation:** The ball response should include server-computed state so the app doesn't re-derive it:
- `current_striker_id` / `current_non_striker_id` after rotation
- `innings_complete` flag
- `next_is_free_hit` flag
- Updated partnership `{ runs, balls }`
- Updated innings totals `{ total_runs, total_wickets, valid_deliveries }`

The app applies the response rather than computing independently.

### 30.2 Scorecard viewer should use WebSocket

**Currently:** Polling.  
**Recommendation:** App subscribes to the same public Reverb channel as the overlay. The `SyncMatchGraphicContextJob` broadcast already contains everything needed for the live score display.

### 30.3 Innings transition should be server-confirmed

**Currently:** Client detects innings end locally; server detects independently.  
**Recommendation:** Ball response returns `innings_complete: true` when innings 1 ends. Client awaits this flag before switching innings, eliminating the timing dependency.

### 30.4 Undo should be semantic ("delete last ball")

**Currently:** `DELETE /balls/:id` deletes any specific ball.  
**Recommendation:** A `DELETE /innings/:id/balls/last` endpoint that deletes exactly the most recent ball and returns the new state. Prevents mid-history deletions that corrupt state.

### 30.5 Ball editing should be supported

**Currently:** No edit UI.  
**Recommendation:** A limited edit flow for the most recent N balls (or just the last ball) should be available. Edit triggers full recalculation and broadcast.

### 30.6 Innings number should auto-track in backoffice

**Currently:** Operator must manually toggle innings.  
**Recommendation:** The live context already contains `innings_number`. Commands should default to the current live innings unless explicitly overridden.

### 30.7 Pending players should be derived from server crease state

**Currently:** App manually patches `pending_players` before first ball; server clears it after first ball.  
**Recommendation:** The server should always know the crease state from ball history (via `InningsStatsService::resolveCreaseAfterBalls`). `pending_players` is only needed for the pre-first-ball period. After any ball is stored, the crease is deterministic from the ball log — `pending_players` becomes redundant.

### 30.8 Graphic command history should not be cleared on match completion

**Currently:** Match completion wipes graphic history.  
**Recommendation:** Preserve history for replay and post-match graphics. Instead, set a `match_completed_at` flag so the operator can see the match is done without losing the ability to re-send commands for highlights.

### 30.9 POTM should be decoupled from match completion revert

**Currently:** POTM nulled if scorer undoes a ball that reverted match completion.  
**Recommendation:** POTM should only be clearable by an explicit operator action, not silently nulled by a ball deletion.

---

*Document generated: 2026-05-15*  
*Based on: develop branch (6 commits ahead of origin), all uncommitted changes across app/src, api/app, backoffice/src*
