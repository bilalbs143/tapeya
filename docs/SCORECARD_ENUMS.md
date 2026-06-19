# Scorecard Enums Reference

PHP enums used by the Tapeya scorecard / scoring engine. All live under `api/app/Enums/`. Cricket rules are enforced server-side; these enums define the allowed values for ball rows, innings/match lifecycle, match setup, and live graphics flashes.

**Related docs:** [SCORECARD_TEST_PLAN.md](./SCORECARD_TEST_PLAN.md) · [SCORECARD_TEST_FINDINGS.md](./SCORECARD_TEST_FINDINGS.md)

**API exposure:** Most scoring enums are returned as `{ value, label }` options from `GET /api/enums` (`App\Http\Controllers\User\EnumController`). Keys match the snake_case names in the table below (e.g. `dismissal_type`, `no_ball_type`).

---

## Use-case validation status

Each enum was validated against documented use cases (not re-testing all scoring logic). Audit: `api/tests/Unit/Enums/ScorecardEnumUseCaseAuditTest.php` plus existing scoring tests where noted.

| Enum | Status | Validated by | Notes |
|------|--------|--------------|-------|
| `DismissalTypeEnum` | ✅ Done | Audit + `DismissalValidationTest`, `ScoringLawCombinationMatrixTest`, `InningsStatsServiceDismissalTypesTest`, `InningsStatsServiceBowlingTest`, `InningsStatsServiceFreeHitTest`, feature wide/no-ball/free-hit tests | Fixed: `retired_hurt` no longer credits bowler (`countsAsBowlerWicket`) |
| `ExtraTypeEnum` | ✅ Done | Audit | UI-only; maps to `is_wide` / `is_no_ball` / `is_bye` / `is_leg_bye` flags |
| `NoBallTypeEnum` | ✅ Done | Audit + `BallDeliveryNormalizerTest` | All 4 cases accepted by `StoreBallRequest` |
| `NoBallRunsTypeEnum` | ✅ Done | Audit + `BallDeliveryNormalizerTest` | `from_bat`, `bye`, `leg_bye` |
| `OverthrowDeliveryTypeEnum` | ✅ Done | Audit | Dismissal context: fair/wide/no_ball only |
| `PenaltyTeamEnum` | ✅ Done | Audit + `InningsStatsServiceComputeTest`, `BallDeliveryNormalizerTest` | Batting vs bowling penalty credit |
| `PenaltyReasonEnum` | ✅ Done | Audit + `BallDeliveryNormalizerTest` | All 12 reasons have labels; API accepts all |
| `ShotPositionEnum` | ✅ Done | Audit | All 8 zones; `StoreBallRequest` validates |
| `InningsStatusEnum` | ✅ Done | Audit + `MatchCompletionServiceTest` | not_started → in_progress → completed |
| `InningsEndReasonEnum` | ✅ Done | Audit | `matchStateReason()` mapping verified |
| `InningsEndedByEnum` | ✅ Done | Audit | Linked from captain/referee end reasons |
| `MatchStatusEnum` | ✅ Done | Audit + `MatchCompletionServiceTest` | Lifecycle through completed |
| `MatchEndReasonEnum` | ✅ Done | Audit | 6 manual end/cancel reasons |
| `MatchBreakTypeEnum` | ✅ Done | Audit | 12 break types; API enum exposure |
| `DeclareResultTypeEnum` | ✅ Done | Audit | award / draw |
| `TargetRevisionActionEnum` | ✅ Done | Audit | continue / end_innings |
| `TossChoiceEnum` | ✅ Done | Audit | bat / bowl |
| `CricketFormatEnum` | ✅ Done | Audit | 4 formats |
| `MatchTimingEnum` | ✅ Done | Audit | day / night / day_and_night |
| `MatchOversEnum` | ✅ Done | Audit | Presets 5–50 |
| `PlayersPerSideEnum` | ✅ Done | Audit | 2, 3, 4, 5, 11 |
| `GraphicCommandKeyEnum` | ✅ Done | `ScoringFlashResolverTest` | Auto-flash queue rules |
| `GraphicCommandTypeEnum` | ✅ Done | Audit | 10 UI groups |
| `GraphicCommandDisplayModeEnum` | ✅ Done | Audit | LT / FS |

**Last run:** 1052 scoring tests passed + 14 audit tests (193 assertions) + 177 enum-focused tests.

---

## Overview

| Group | Namespace | Count | Primary consumers |
|-------|-----------|-------|-------------------|
| Ball delivery | `App\Enums\Event` | 8 | `StoreBallRequest`, `UpdateBallRequest`, `Ball`, `BallDeliveryNormalizer`, `InningsStatsService` |
| Innings lifecycle | `App\Enums\Event` | 3 | `Innings`, `InningsLifecycleService`, `MatchStateService` |
| Match lifecycle | `App\Enums\Event` | 5 | `MatchLifecycleService`, `MatchCompletionService`, `ScorecardController` |
| Match setup | `App\Enums\Event` | 5 | Toss, Start Match, tournament config |
| Live graphics | `App\Enums\Broadcast` | 3 | `ScoringFlashResolver`, backoffice graphics controller |

Enums **not** covered here (profile, shop, push, tournament admin, etc.) are unrelated to scorecard logic.

---

## Ball delivery

### `DismissalTypeEnum`

**Validation:** ✅ Done — see [use-case validation](#use-case-validation-status).

**File:** `api/app/Enums/Event/DismissalTypeEnum.php`  
**Stored on:** `balls.dismissal_type` (when `is_wicket = true` or retired)  
**Enum API key:** `dismissal_type`

| Value | Label | Wicket? | Bowler credit? | Notes |
|-------|-------|---------|----------------|-------|
| `bowled` | Bowled | Yes | Yes | |
| `caught` | Caught | Yes | Yes | Requires `fielder_id` |
| `stumped` | Stumped | Yes | Yes | Requires `fielder_id` |
| `lbw` | LBW | Yes | Yes | |
| `run_out` | Run Out | Yes | No | Requires `fielder_id`; valid on free hit, wide, no-ball |
| `mankad` | Mankad | Yes | No | Non-striker run-out; bowler acts as fielder |
| `retired` | Retired Out | Yes | No | Administrative wicket |
| `retired_hurt` | Retired Hurt | **No** | No | `is_wicket=true` for audit; batter may return |
| `hit_wicket` | Hit Wicket | Yes | Yes | |
| `hit_ball_twice` | Hit Ball Twice | Yes | No | Valid on free hit, no-ball |
| `timed_out` | Timed Out | Yes | No | |
| `obstructing_the_field` | Obstructing the Field | Yes | No | Valid on free hit, wide, no-ball |

**Key methods:** `countsAsWicket()`, `countsAsBowlerWicket()`, `validOnFreeHit()`, `validOnWideDelivery()`, `validOnNoBallDelivery()`, `requiresFielder()`.

---

### `ExtraTypeEnum`

**File:** `api/app/Enums/Event/ExtraTypeEnum.php`  
**Enum API key:** `extra_type`  
Presentation / UI only; persisted via boolean flags on `balls` (`is_wide`, `is_no_ball`, etc.).

| Value | Label | Short |
|-------|-------|-------|
| `wd` | Wide | WD |
| `nb` | No Ball | NB |
| `bye` | Bye | BYE |
| `lb` | Leg Bye | LB |

---

### `NoBallTypeEnum`

**File:** `api/app/Enums/Event/NoBallTypeEnum.php`  
**Stored on:** `balls.no_ball_type`  
**Enum API key:** `no_ball_type`

| Value | Label |
|-------|-------|
| `over_footed` | Front Foot No-Ball |
| `over_heighten` | High Full Toss |
| `field_restriction` | Field Restriction |
| `bowling_action` | Bowling Action |

---

### `NoBallRunsTypeEnum`

**File:** `api/app/Enums/Event/NoBallRunsTypeEnum.php`  
**Stored on:** `balls.no_ball_runs_type`  
**Enum API key:** `no_ball_runs_type`

| Value | Label |
|-------|-------|
| `from_bat` | From Bat |
| `bye` | Bye |
| `leg_bye` | Leg Bye |

---

### `OverthrowDeliveryTypeEnum`

**File:** `api/app/Enums/Event/OverthrowDeliveryTypeEnum.php`  
**Stored on:** `balls.overthrow_delivery_type`  
**Enum API key:** `overthrow_delivery_type`

| Value | Label |
|-------|-------|
| `fair` | Fair Delivery |
| `wide` | Wide |
| `no_ball` | No Ball |
| `bye` | Bye |
| `leg_bye` | Leg Bye |

Used when recording overthrows and for dismissal delivery context chips (`validForDismissalDeliveryContext()` excludes bye/LB).

---

### `PenaltyTeamEnum`

**File:** `api/app/Enums/Event/PenaltyTeamEnum.php`  
**Stored on:** `balls.penalty_team`  
**Enum API key:** `penalty_team`

| Value | Label |
|-------|-------|
| `batting` | Batting |
| `bowling` | Bowling |

Determines which side receives penalty runs on a penalty ball row.

---

### `PenaltyReasonEnum`

**File:** `api/app/Enums/Event/PenaltyReasonEnum.php`  
**Stored on:** `balls.penalty_reason`  
**Enum API key:** `penalty_reason`

| Value | Label |
|-------|-------|
| `deliberate_short_run` | Deliberate Short Run |
| `time_wasting_batting` | Time Wasting by Batting Side |
| `damaging_pitch_batting` | Damaging the Pitch by Batting Side |
| `practice_on_field_batting` | Practice on the Field by Batting Side |
| `unfair_stealing_run` | Batter Unfairly Stealing a Run |
| `time_wasting_bowling` | Time Wasting by Bowling Side |
| `damaging_pitch_bowling` | Damaging the Pitch by Bowling Side |
| `ball_tampering` | Ball Tampering |
| `deliberate_distraction` | Deliberate Distraction of Batter |
| `fielding_restriction_breach` | Fielding Restriction Breach |
| `super_ball` | Super Ball |
| `unfair_actions` | Unfair Actions |

---

### `ShotPositionEnum`

**File:** `api/app/Enums/Event/ShotPositionEnum.php`  
**Stored on:** `balls.shot_position`  
**Enum API key:** `shot_position`  
Used for wagon wheel / shot-area graphics and stats.

| Value | Label |
|-------|-------|
| `deep_fine_leg` | Deep Fine Leg |
| `third_man` | Third Man |
| `deep_point` | Deep Point |
| `deep_cover` | Deep Cover |
| `long_off` | Long Off |
| `long_on` | Long On |
| `mid_wicket` | Mid Wicket |
| `square_leg` | Square Leg |

---

## Innings lifecycle

### `InningsStatusEnum`

**File:** `api/app/Enums/Event/InningsStatusEnum.php`  
**Stored on:** `innings.status`

| Value | Label |
|-------|-------|
| `not_started` | Not Started |
| `in_progress` | In Progress |
| `completed` | Completed |

---

### `InningsEndReasonEnum`

**File:** `api/app/Enums/Event/InningsEndReasonEnum.php`  
**Stored on:** `innings.end_reason`  
**Enum API key:** `innings_end_reason`

| Value | Label | `matchStateReason()` |
|-------|-------|----------------------|
| `all_out` | All Out | `all_out` |
| `overs_bowled` | Overs Bowled | `overs_complete` |
| `runs_chased` | Runs Chased | `target_reached` |
| `target_revision` | Target Revised (DLS) | `target_reached` |
| `out_of_time` | Out of Time | `manual` |
| `captain` | Captain End Innings | `manual` |
| `referee` | Referee End Innings | `manual` |
| `rain` | Ended Due to Rain | `manual` |

`matchStateReason()` is sent in `match_state.active_innings.innings_complete_reason` for the frontend `InningsEndDialog`.

---

### `InningsEndedByEnum`

**File:** `api/app/Enums/Event/InningsEndedByEnum.php`  
**Stored on:** `innings.ended_by`

| Value | Label |
|-------|-------|
| `system` | System |
| `captain` | Captain |
| `referee` | Referee |

Set automatically for manual end reasons via `InningsEndReasonEnum::endedBy()`.

---

## Match lifecycle

### `MatchStatusEnum`

**File:** `api/app/Enums/Event/MatchStatusEnum.php`  
**Stored on:** `tournament_matches.status`

| Value | Label |
|-------|-------|
| `scheduled` | Scheduled |
| `toss_done` | Toss Done |
| `in_progress` | In Progress |
| `completed` | Completed |
| `cancelled` | Cancelled |

---

### `MatchEndReasonEnum`

**File:** `api/app/Enums/Event/MatchEndReasonEnum.php`  
**Enum API key:** `match_end_reason`  
Used when an organizer manually ends or cancels a match.

| Value | Label |
|-------|-------|
| `heavy_rain` | Heavy Rain |
| `unplayable_pitch` | Unplayable Pitch |
| `low_light` | Bad Light |
| `crowd_disturbance` | Disturbance In Crowd |
| `atmosphere` | Atmospheric Conditions |
| `other` | Other |

---

### `MatchBreakTypeEnum`

**File:** `api/app/Enums/Event/MatchBreakTypeEnum.php`  
**Enum API key:** `match_break_type`  
Recorded during live scoring (Action → Add Breaks).

| Value | Label |
|-------|-------|
| `short_drinks` | Short Drinks Break |
| `lunch` | Lunch Break |
| `dinner` | Dinner Break |
| `strategic_timeout` | Strategic Timeout |
| `rain_stop` | Rain Stopped Play |
| `pitch_conditions` | Pitch Conditions Inspection |
| `bad_light` | Bad Light |
| `emergency` | Emergency |
| `bad_weather` | Bad Weather |
| `teams_not_present` | Teams Not Ready |
| `tea` | Tea Break |
| `other` | Other |

---

### `DeclareResultTypeEnum`

**File:** `api/app/Enums/Event/DeclareResultTypeEnum.php`

| Value | Label |
|-------|-------|
| `award` | Match Awarded |
| `draw` | Draw |

---

### `TargetRevisionActionEnum`

**File:** `api/app/Enums/Event/TargetRevisionActionEnum.php`  
Used when applying a revised DLS / manual target.

| Value | Label |
|-------|-------|
| `continue` | Continue Innings |
| `end_innings` | End Innings |

---

## Match setup

These affect match configuration before or at the start of scoring. Exposed via `EnumController` for Start Match and tournament forms.

### `TossChoiceEnum`

**File:** `api/app/Enums/Event/TossChoiceEnum.php`  
**Enum API key:** `toss_choice`

| Value | Label |
|-------|-------|
| `bat` | Bat |
| `bowl` | Bowl |

---

### `CricketFormatEnum`

**File:** `api/app/Enums/Event/CricketFormatEnum.php`  
**Enum API key:** `cricket_format`

| Value | Label |
|-------|-------|
| `hard_ball` | Hard Ball |
| `tape_ball` | Tape Ball |
| `tennis_ball` | Tennis Ball |
| `hard_tennis` | Hard Tennis |

---

### `MatchTimingEnum`

**File:** `api/app/Enums/Event/MatchTimingEnum.php`  
**Enum API key:** `match_timings`

| Value | Label |
|-------|-------|
| `day` | Day |
| `night` | Night |
| `day_and_night` | Day & Night |

---

### `MatchOversEnum` (int-backed)

**File:** `api/app/Enums/Event/MatchOversEnum.php`  
**Enum API key:** `match_overs`

Values: `5`, `10`, `15`, `20`, `25`, `30`, `40`, `50`

---

### `PlayersPerSideEnum` (int-backed)

**File:** `api/app/Enums/Event/PlayersPerSideEnum.php`  
**Enum API key:** `players_per_side`

Values: `2`, `3`, `4`, `5`, `11` (wickets / players per side presets)

---

## Live graphics (scoring side-effects)

When a ball is stored, `ScoringFlashResolver` may queue lower-third graphic flashes. Full command catalog is defined in `GraphicCommandKeyEnum` (~80 keys); only scoring-triggered keys are listed here.

### `GraphicCommandKeyEnum` — auto-flash on ball store

**File:** `api/app/Enums/Broadcast/GraphicCommandKeyEnum.php`  
**Resolver:** `api/app/Services/Broadcast/ScoringFlashResolver.php`

| Ball event | Commands queued |
|------------|-----------------|
| Wide | `LT_WIDE` |
| Wide + wicket | `LT_WIDE`, `LT_OUT` |
| No-ball | `LT_NO_BALL` |
| No-ball + 4 off bat | `LT_NO_BALL`, `LT_FOUR` |
| No-ball + 6 off bat | `LT_NO_BALL`, `LT_SIX` |
| No-ball + wicket | `LT_NO_BALL`, `LT_OUT` |
| Wicket (fair delivery) | `LT_OUT` |
| 4 off bat | `LT_FOUR` |
| 6 off bat | `LT_SIX` |
| Retired hurt | *(none — not a dismissal flash)* |
| Dot / 1–3 / bye / LB | *(none)* |

Wicket on a boundary shows `LT_OUT` only (no boundary flash). See resolver docblock for full rules.

Other graphic keys (scorecard LT, wagon wheel, playing XI, etc.) are triggered manually from the backoffice graphics controller, not from ball store.

---

### `GraphicCommandTypeEnum`

**File:** `api/app/Enums/Broadcast/GraphicCommandTypeEnum.php`  
Groups commands in the match graphics UI.

| Value | UI section |
|-------|------------|
| `LOWER_THIRD` | Lower Third |
| `FULL_SCREEN` | Full Screen |
| `TOUR_HITS` | Tour Hits |
| `FULL_SCREEN_TRANSITION` | Full Screen Transitions |
| `BREAK` | Breaks |
| `TOURNAMENT` | Tournament |
| `CHART` | Charts |
| `BATSMAN_STATS` | Batsman |
| `BOWLER_STATS` | Bowler |
| `CAPTION` | Caption |

---

### `GraphicCommandDisplayModeEnum`

**File:** `api/app/Enums/Broadcast/GraphicCommandDisplayModeEnum.php`

| Value | Meaning |
|-------|---------|
| `LT` | Lower third |
| `FS` | Full screen |

---

## Code map

| Enum | Main files |
|------|------------|
| Ball enums | `ScorecardController`, `StoreBallRequest`, `UpdateBallRequest`, `Ball.php`, `BallDeliveryNormalizer.php`, `InningsStatsService.php` |
| Innings enums | `Innings.php`, `InningsLifecycleController`, `InningsLifecycleService.php`, `MatchStateService.php` |
| Match enums | `MatchLifecycleService.php`, `MatchCompletionService.php`, `TournamentMatch.php` |
| Setup enums | `MatchTossController`, `EnumController`, `Tournament.php` |
| Broadcast enums | `ScoringFlashResolver.php`, `GraphicCommandController`, `GraphicCommandManifestBuilder.php` |

All enums use `App\Enums\BaseEnumTrait` for shared helpers (`label()`, serialization, etc.).
