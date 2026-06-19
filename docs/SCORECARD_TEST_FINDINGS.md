# Scorecard Test Findings

Log of bugs, inconsistencies, and ambiguities discovered during the comprehensive scorecard test initiative.

## Fixed defects

### BUG-001: Retired hurt incorrectly ended partnerships

| Field | Detail |
|-------|--------|
| **Severity** | Medium |
| **Location** | `api/app/Services/PlayerStatsService.php` → `partnershipsForInnings()` |
| **Symptom** | A `retired_hurt` dismissal closed the current partnership and started a new stand, contradicting `MatchStateService::currentPartnership()` which explicitly excludes retired hurt from resetting the counter (S3 comment). |
| **Root cause** | Partnership loop checked `is_wicket && out_player_id` without `!isRetiredHurt()`. |
| **Fix** | Added `! $ball->isRetiredHurt()` guard. |
| **Regression test** | `PlayerStatsPartnershipsTest::test_retired_hurt_does_not_end_partnership` |

### BUG-002: Retired hurt credited bowler wicket via enum default

| Field | Detail |
|-------|--------|
| **Severity** | Low |
| **Location** | `api/app/Enums/Event/DismissalTypeEnum.php` → `countsAsBowlerWicket()` |
| **Symptom** | `retired_hurt` fell through to `default => true`, so `InningsStatsService` could increment bowler wickets on a non-dismissal event. |
| **Root cause** | `RETIRED_HURT` missing from the explicit false list; `InningsStatsServiceDismissalTypesTest` skipped bowler credit for this case. |
| **Fix** | Added `RETIRED_HURT` to non-bowler-wicket cases. |
| **Regression test** | `InningsStatsServiceDismissalTypesTest::test_dismissal_bowler_credit_matches_enum` (all cases) + `ScorecardEnumUseCaseAuditTest` |

### BUG-003: needs_new_bowler suppressed on fielding dismissals at over end

| Field | Detail |
|-------|--------|
| **Severity** | Medium |
| **Location** | `api/app/Services/MatchStateService.php` → `$overEndedOnWicket` |
| **Symptom** | Run-out, obstructing, hit-ball-twice (and other non-bowler wickets) on the 6th legal ball suppressed `needs_new_bowler`, so the scorer never got the bowler-change prompt after a fielding dismissal at over end. |
| **Root cause** | `$overEndedOnWicket` checked any wicket except retired hurt, instead of bowler-credited dismissals only. |
| **Fix** | Require `$lastBall->dismissal_type->countsAsBowlerWicket()`. |
| **Regression test** | `MatchStateServiceNeedsNewBowlerTest` |

### BUG-004: Manual innings end reverted by MatchCompletionService

| Field | Detail |
|-------|--------|
| **Severity** | High |
| **Location** | `api/app/Services/MatchCompletionService.php` → `evaluate()` |
| **Symptom** | Captain/referee/rain end (especially 0-ball innings) was immediately reverted to `not_started` / `in_progress` because `shouldCompleteInnings()` returned false. |
| **Root cause** | Auto-evaluate path treated all `COMPLETED` innings without scoring completion as revert candidates, ignoring `end_reason` set by `InningsLifecycleService`. |
| **Fix** | Skip revert when `isManuallyEnded()` (`end_reason` is set). |
| **Regression test** | `InningsLifecycleControllerEndTest` |

---

## Multi-angle findings — verification (2026-06)

All six fixes below were re-verified in code and with targeted tests.

| # | Finding | Fix location | Verified by |
|---|---------|--------------|-------------|
| 1 | `$overEndedOnWicket` too broad | `MatchStateService.php:112-115` | `MatchStateServiceNeedsNewBowlerTest` (3 cases) |
| 2 | `pending_players` dead write on overlay | `graphicSessionSync.js` | Vitest `graphicSessionSync.test.js`; no `pending_players` reads under `app/src/graphics/` |
| 3 | Pusher broadcast inside DB transaction | `MatchSubstituteController.php:123-137` | Code review: `MatchPendingState::merge` in txn; `syncAndBroadcast` after commit |
| 4 | Duplicate `isLegalDelivery` logic | `BallDeliveryPresenter.php:46` | `BallDeliveryPresenterTest::test_present_uses_ball_model_is_legal_delivery` |
| 5 | Array `normalize` `over` vs `over_number` | `BallDeliveryPresenter.php:196` | `BallDeliveryPresenterTest::test_present_array_accepts_over_column_name` |
| 6 | `innings2SetupPromptedRef` double meaning | `ScoringTab.jsx:599-602` | Code review: ref set only when dialog opens; early return when batters seated |

**Suite:** 1071 scoring tests — all passing after AMB fixes.

---

## Documented inconsistencies — resolved

### AMB-001: Partnership ball count vs live partnership ball count — **Fixed**

| Field | Detail |
|-------|--------|
| **Location** | `PlayerStatsService::partnershipsForInnings` |
| **Fix** | Partnership `balls` now increments only on `Ball::isLegalDelivery()`, matching `MatchStateService::currentPartnership()`. |
| **Regression test** | `PlayerStatsPartnershipsTest::test_partnership_ball_count_matches_match_state_live_partnership` |

### AMB-002: Partnership per-player runs use raw `runs_off_bat` — **Fixed**

| Field | Detail |
|-------|--------|
| **Location** | `PlayerStatsService::partnershipsForInnings` |
| **Fix** | Striker runs and balls faced use `InningsStatsService::strikerRunsOffBat()` and `isLegalDelivery()` respectively. |
| **Regression test** | `PlayerStatsPartnershipsTest::test_no_ball_striker_runs_use_striker_runs_off_bat_helper` |

### AMB-003: `MatchCompletionService::totalsFromBalls` vs `inningsRuns` — **Fixed**

| Field | Detail |
|-------|--------|
| **Location** | `MatchCompletionService` |
| **Fix** | Replaced `totalsFromBalls()` / separate `inningsRuns()` with unified `inningsTotals()` via `InningsStatsService::compute()`. |
| **Regression test** | `MatchCompletionServiceTest::test_second_innings_completes_when_chase_met_via_additional_runs_only` |

---

## Out of scope / not implemented

| Item | Notes |
|------|-------|
| Super overs | No code paths exist; no tests added. |
| Automated DLS calculator | Only manual `revised_target`; tested in `MatchCompletionServiceTest::test_dls_revised_target_used_for_chase`. |
| `ScorecardController` HTTP feature tests | **Phase 2 complete** — see Feature layer below. |

---

## Phase 2 additions (992 tests total)

### HTTP feature tests (`api/tests/Feature/Scoring/`)

| File | Coverage |
|------|----------|
| `ScorecardControllerWideWicketValidationTest` | Rejects bowled/caught/LBW/etc. on wide; accepts run-out and stumped |
| `ScorecardControllerNoBallWicketValidationTest` | Rejects invalid dismissals on no-ball; accepts run-out with/without runs |
| `ScorecardControllerFreeHitValidationTest` | Rejects invalid dismissals on free hit; accepts run-out |
| `ScorecardControllerStoreBallTest` | Happy paths (dot, wide, 6-ball over, 403 for non-staff) |

Uses `ScoresViaApi` trait + `BuildsScoringMatch` for authenticated organizer scoring against PostgreSQL (`tapeya_test`).

**See also:** [SCORECARD_ENUMS.md](./SCORECARD_ENUMS.md) — dismissal types, extras, innings/match lifecycle enums.

### Property-based expansion

| File | Coverage |
|------|----------|
| `InningsStatsServicePropertyTest` | 250 deterministic seeds × 3 invariants (extras sum, legal-ball count, wicket count, crease IDs) |
| `InningsStatsServiceDismissalTypesTest` | All 12 dismissal types × bowler credit / wicket count / FOW |
| `ScoringLawCombinationMatrixTest` | Valid/invalid dismissal × wide / no-ball / free-hit matrix |
| `MatchCompletionChaseEdgeCasesTest` | Chase completed on wicket ball at target |

Support: `ScoringPropertyGenerator` (seeded random innings), `ScoresViaApi` (HTTP helpers).

### Phase 2 fix

Removed a bogus invariant in `InningsStatsServicePropertyTest` (`legal_balls + count(balls) <= count(balls)`). Legal-ball consistency is asserted via `isLegalDelivery()` model filter vs `compute()` output.

---

## Test suite summary

| File | Domain |
|------|--------|
| `InningsStatsServiceLegalDeliveryTest` | Legal delivery classification, overs display |
| `InningsStatsServiceComputeTest` | Totals, extras, batting, FOW, retired hurt |
| `InningsStatsServiceStrikeRotationTest` | MCC strike rotation rules |
| `InningsStatsServiceBowlingTest` | Maidens, economy, wicket credit |
| `InningsStatsServiceWicketsTest` | Run-out crossing, wide/NB wickets |
| `InningsStatsServiceFreeHitTest` | Free-hit chain |
| `DismissalValidationTest` | Enum validation matrices |
| `PlayerStatsPartnershipsTest` | Partnership aggregation |
| `MatchCompletionServiceTest` | Innings/match completion, ties, DLS |
| `BallDeliveryNormalizerTest` | Payload normalization |
| `ScoringEdgeCasesTest` | Combined law edge cases |
| `InningsStatsServicePropertyTest` | 250-seed property invariants |
| `InningsStatsServiceDismissalTypesTest` | Per-dismissal-type stats |
| `ScoringLawCombinationMatrixTest` | Dismissal × delivery-context matrix |
| `MatchCompletionChaseEdgeCasesTest` | Chase edge on wicket ball |
| `ScorecardControllerWideWicketValidationTest` | HTTP wide wicket validation |
| `ScorecardControllerNoBallWicketValidationTest` | HTTP no-ball wicket validation |
| `ScorecardControllerFreeHitValidationTest` | HTTP free-hit validation |
| `ScorecardControllerStoreBallTest` | HTTP store-ball happy paths |
| `ScorecardControllerUpdateDeleteBallTest` | HTTP update/delete/undo ball |
| `InningsLifecycleControllerEndTest` | HTTP manual end innings (captain, all_out validation, conflict) |
| `MatchSubstituteControllerTest` | HTTP substitute (pre-ball + mid-innings, validation, auth) |

**Run:** `cd api && composer test:scoring` (1071 tests). CI: `.github/workflows/scoring-checks.yml`.
