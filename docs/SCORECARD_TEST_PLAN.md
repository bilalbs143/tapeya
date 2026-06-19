# Scorecard Engine — Comprehensive Test Plan

This document defines the structured test strategy for making the Tapeya scorecard/scoring engine production-proof. All cricket rules are enforced server-side in the Laravel API (`InningsStatsService`, `MatchCompletionService`, `ScorecardController`, `PlayerStatsService`).

**See also:** [SCORECARD_ENUMS.md](./SCORECARD_ENUMS.md) — reference for all scorecard-related PHP enums.

## Goals

1. Cover every scoring scenario with explicit, commented test cases.
2. Expose hidden edge cases (free-hit chains, run-out crossing, extras + wickets, chase completion).
3. Add regression tests for every defect discovered during implementation.
4. Protect future refactors of `InningsStatsService::compute()` and `resolveCreaseAfterBalls()`.

## Test Layers

| Layer | Location | Framework | Scope |
|-------|----------|-----------|-------|
| Unit (pure) | `api/tests/Unit/Services/Scoring/` | PHPUnit | Ball model helpers, `InningsStatsService`, enums, normalizer |
| Unit (DB) | `api/tests/Unit/Services/Scoring/MatchCompletion*` | PHPUnit + PostgreSQL (`tapeya_test`) | Innings/match completion, winner calculation |
| Contract | `shared/ball-delivery/` + `BallDeliveryPresenterTest` | Vitest + PHPUnit | Presentation chips (existing) |
| Feature | `api/tests/Feature/Scoring/` | PHPUnit + HTTP + PostgreSQL | `ScorecardController` validation, store-ball, auth |

## Domain Groups

### 1. Legal delivery & ball counting (`InningsStatsServiceOverTrackingTest`)

- Dot balls, singles–sixes count as legal deliveries.
- Wides and no-balls are **illegal** (extra delivery, over continues).
- Penalty-only and additional-runs-only rows are not deliveries.
- `dont_count_ball` flag excludes from over count.
- Extra illegal deliveries after 6th legal ball do not start a new over prematurely.
- `nextBallPosition()` and `currentOverDetails()` agree on over boundaries.
- Maiden over detection (6 legal balls, 0 runs charged to bowler excl. byes/LB).

### 2. Runs & extras (`InningsStatsServiceComputeTest`)

- Team total = sum of `runs` + `additional_runs` + batting-side `penalty_runs`.
- Extras breakdown: wides (all wide runs), no-balls (penalty + non-batter portion), byes, leg-byes, penalty.
- Wide: all runs are extras; batter gets 0 off bat.
- No-ball + runs off bat: batter credited, NB extras = total − runs_off_bat.
- Byes/LB on legal delivery: extras only, 0 off bat.
- Cross-innings bowling-side penalties credited when team bats.

### 3. Batting statistics (`InningsStatsServiceComputeTest`)

- Balls faced: legal deliveries only; wides do not count.
- Dots, ones, twos, threes, fours, sixes from `strikerRunsOffBat`.
- No-ball runs off bat credited; no-ball does not add to balls faced.
- Retired hurt: dismissal recorded but **not** a wicket; batter may return.
- Retired out: counts as wicket; not credited to bowler.
- Strike rate calculation.

### 4. Bowling statistics (`InningsStatsServiceBowlingTest`)

- Legal balls bowled, runs conceded (excl. byes/LB), dots, wickets.
- Wicket credit: bowled/caught/stumped/LBW/hit-wicket yes; run-out/Mankad/retired/timed-out no.
- Maiden overs (6 legal, 0 runs excl. byes/LB).
- Economy rate formatting.

### 5. Strike rotation (`InningsStatsServiceStrikeRotationTest`)

- Odd runs off bat (fair, no-ball) → rotate.
- Odd bye/LB (fair or no-ball) → rotate.
- Wide: odd runs **beyond** 1-run penalty → rotate.
- Even runs → no rotation.
- End of over (6th legal): always change ends (independent of odd rotation).
- Wicket on last ball of over: rotation + end-of-over swap.
- Penalty/additional-runs-only: no rotation.

### 6. Wicket crease resolution (`InningsStatsServiceWicketsTest`)

- Bowled/caught/LBW/stumped: incoming batter at striker's end.
- Run-out not crossed: out end vacated, survivor faces (if at striker's end).
- Run-out crossed: positions flip per MCC crossing rules.
- Mankad non-striker out: striker continues.
- Wicket + runs before dismissal (e.g. run-out on 3rd run).
- Wicket on wide / no-ball / free-hit combinations.

### 7. Free hit (`InningsStatsServiceFreeHitTest`)

- After no-ball → next delivery is free hit.
- Free-hit wide → free hit repeats.
- After legal delivery following free hit → free hit cleared.
- Valid dismissals on free hit: run_out, obstructing_the_field, hit_ball_twice only.

### 8. Fall of wickets & partnerships

- FOW score and overs at each genuine wicket.
- Retired hurt excluded from FOW and wicket count.
- `PlayerStatsService::partnershipsForInnings` — runs, balls, per-player splits.
- `MatchStateService` current partnership — legal balls only; retired hurt does not break stand.

### 9. Innings & match completion (`MatchCompletionServiceTest`)

- All out at `players_per_side - 1` wickets.
- Overs exhausted at `overs × 6` legal balls.
- Second innings chase: `runs >= target` (first innings + 1 or DLS `revised_target`).
- Chase on extras (wide/no-ball runs pushing total over target).
- Tie when scores level.
- Win by runs / win by wickets.
- Completion reverts on ball delete (undo).
- Cancelled / declared-result matches not re-evaluated.

### 10. DLS (manual revision)

- `revised_target` overrides `firstInningsRuns + 1`.
- Chase completes at revised target exactly.

### 11. Validation & normalization

- `DismissalTypeEnum`: validOnFreeHit, validOnWide, validOnNoBall, countsAsWicket, countsAsBowlerWicket.
- `BallDeliveryNormalizer`: run-out extras, overthrow, combined wide/no-ball wicket.
- `ScorecardController` server-side free-hit and dismissal validation (Feature tests).

### 13. Property-based & matrix tests (Phase 2)

- `ScoringPropertyGenerator`: 250 deterministic seeds produce random innings (wides, no-balls, wickets, free-hit chains).
- Core invariants on every seed: non-negative totals, extras breakdown sums, `legal_balls` matches model `isLegalDelivery()`, wicket count excludes retired hurt, crease IDs from squad.
- `InningsStatsServiceDismissalTypesTest`: each of 12 dismissal types — wicket credit, bowler credit, FOW.
- `ScoringLawCombinationMatrixTest`: enum validation mirrored against `DismissalTypeEnum` helpers.
- `MatchCompletionChaseEdgeCasesTest`: chase completes when wicket ball pushes total to target.

### 14. HTTP feature tests (Phase 2)

- Auth: tournament organizer via `actingAs(..., 'api')`.
- First ball requires `pending_crease` on match.
- Validation failures: HTTP 422, `type: VALIDATION_ERROR`.
- Wide: only run-out, stumped, obstructing-the-field valid.
- No-ball / free hit: only run-out, obstructing-the-field, hit-ball-twice valid.
- Store-ball: dot, wide, 6-legal-ball over completion, forbidden for non-staff.
- Update/delete: correct runs, delete by ID, semantic undo (`DELETE .../balls/last`), forbidden for non-staff.
- Wide wicket: obstructing-the-field accepted (Law 37).

### 12. Explicit edge-case matrix (must-have)

| Scenario | Expected behaviour |
|----------|-------------------|
| Wicket on no-ball | Only run-out/obstruct/hit-twice; ball illegal; free hit follows |
| Wicket on wide | Run-out/stumped/obstruct only |
| Run-out on NB without runs | Strike rotation none; crease per run-out rules |
| Run-out on NB with odd runs | Rotate before crease resolution |
| Run-out on wide | Same as NB with wide penalty |
| Multiple runs + wicket | Runs added to total; rotation before dismissal |
| Last ball over wicket | End-of-over swap after dismissal |
| Last ball innings wicket | Innings may complete; FOW correct |
| Extra delivery over transition | NB/wide after 6th legal stays same over index |
| Chase on wide boundary | Innings completes when total ≥ target |
| Match-winning 4 with overthrows | Total runs include all runs on delivery |
| Retired hurt mid-partnership | Partnership continues |

## Out of scope (documented)

- **Super overs** — not implemented in codebase.
- **Automated DLS calculator** — only manual `revised_target` revision supported.
- **Frontend `useScoringEngine`** — thin API wrapper; rules tested at API layer.

## Running tests

Tests use a **dedicated PostgreSQL database** (`tapeya_test`), not your dev database. Copy the example env and create the database once:

```bash
cd api
cp .env.testing.example .env.testing
# Edit .env.testing if your Postgres credentials differ from the defaults.

createdb tapeya_test   # or: psql -c "CREATE DATABASE tapeya_test;"
composer test:scoring
```

PHPUnit reads DB settings from `phpunit.xml` (and optionally `.env.testing`). CI provisions Postgres via `.github/workflows/scoring-checks.yml`.

```bash
cd api && composer test:scoring
```

Runs all unit + feature scoring tests.

```bash
cd api && ./vendor/bin/phpunit tests/Unit/Services/Scoring/
cd api && ./vendor/bin/phpunit tests/Feature/Scoring/
```

## Findings log

See [SCORECARD_TEST_FINDINGS.md](./SCORECARD_TEST_FINDINGS.md) for bugs, ambiguities, and regression test references.
