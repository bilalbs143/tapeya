<?php

namespace App\Services;

use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\TournamentMatch;
use Illuminate\Support\Collection;

/**
 * Marks innings and the match as completed from ball data, sets match winner for standings.
 * Re-evaluates on every change (including ball delete) so completion and winner can revert.
 *
 * Rules (aligned with organizer scoring): legal ball = {@see Ball::isLegalDelivery()};
 * innings ends on max wickets, allocated overs exhausted, or (2nd innings only) runs > target.
 */
class MatchCompletionService
{
    public function __construct(
        private readonly InningsStatsService $inningsStats,
    ) {}

    public function evaluate(TournamentMatch $match): void
    {
        if ($match->status === MatchStatusEnum::CANCELLED) {
            return;
        }

        if ($match->status === MatchStatusEnum::COMPLETED && $match->declare_result_type !== null) {
            return;
        }

        $match->loadMissing([
            'innings' => fn ($q) => $q->orderBy('innings_number'),
        ]);

        if ($match->innings->count() < 2) {
            return;
        }

        /** @var Innings|null $inn1 */
        $inn1 = $match->innings->firstWhere('innings_number', 1);
        /** @var Innings|null $inn2 */
        $inn2 = $match->innings->firstWhere('innings_number', 2);
        if (! $inn1 || ! $inn2) {
            return;
        }

        $pps = (int) ($match->players_per_side ?: 11);
        $maxWickets = max(0, $pps - 1);
        $oversLimit = max(1, (int) ($match->overs ?: 20));

        // S2: fetch each innings' balls exactly once — balls do not change during evaluate().
        // Only innings.status changes; we refresh the status-only model after each update.
        $balls1 = $this->orderedBalls($inn1);
        $balls2 = $this->orderedBalls($inn2);

        $hasBalls1 = $balls1->isNotEmpty();
        $hasBalls2 = $balls2->isNotEmpty();

        $inn1ShouldComplete = $this->shouldCompleteInnings(
            $match, $inn1, $balls1, $maxWickets, $oversLimit, null, false,
        );

        if ($inn1ShouldComplete) {
            if ($inn1->status !== InningsStatusEnum::COMPLETED) {
                $inn1->update(['status' => InningsStatusEnum::COMPLETED]);
            }
        } elseif ($inn1->status === InningsStatusEnum::COMPLETED && ! $this->isManuallyEnded($inn1)) {
            $inn1->update(['status' => $hasBalls1 ? InningsStatusEnum::IN_PROGRESS : InningsStatusEnum::NOT_STARTED]);
        }

        // Refresh status only — balls collection is reused (it hasn't changed).
        $inn1->refresh();

        $inn1IsComplete = $inn1->status === InningsStatusEnum::COMPLETED;
        $firstRuns = $inn1IsComplete ? $this->inningsTotals($match, $inn1, $balls1)['runs'] : 0;

        $chaseTarget = $inn1IsComplete
            ? $match->chaseTargetForSecondInnings($firstRuns)
            : null;

        $inn2ShouldComplete = $inn1IsComplete && $this->shouldCompleteInnings(
            $match, $inn2, $balls2, $maxWickets, $oversLimit, $chaseTarget, true,
        );

        if ($inn2ShouldComplete) {
            if ($inn2->status !== InningsStatusEnum::COMPLETED) {
                $inn2->update(['status' => InningsStatusEnum::COMPLETED]);
            }
        } elseif ($inn2->status === InningsStatusEnum::COMPLETED && ! $this->isManuallyEnded($inn2)) {
            $inn2->update(['status' => $hasBalls2 ? InningsStatusEnum::IN_PROGRESS : InningsStatusEnum::NOT_STARTED]);
        }

        $inn1->refresh();
        $inn2->refresh();

        if ($inn1->status !== InningsStatusEnum::COMPLETED || $inn2->status !== InningsStatusEnum::COMPLETED) {
            if ($match->status === MatchStatusEnum::COMPLETED) {
                // Revert match to in_progress. winning_team_id → null because there is
                // currently no winner (the match is incomplete). S15: was incorrectly
                // set to toss_winner_team_id, which is unrelated to the previous winner.
                $match->update([
                    'status' => MatchStatusEnum::IN_PROGRESS,
                    'winning_team_id' => null,
                    'win_by_runs' => null,
                    'win_by_wickets' => null,
                ]);
            }

            return;
        }

        // Both innings complete — compute final result using the already-loaded ball collections.
        $t1 = $this->inningsTotals($match, $inn1, $balls1);
        $t2 = $this->inningsTotals($match, $inn2, $balls2);
        $r1 = ['runs' => $t1['runs'], 'wickets' => $t1['wickets']];
        $r2 = ['runs' => $t2['runs'], 'wickets' => $t2['wickets']];

        $batFirstId = (int) $inn1->batting_team_id;
        $batSecondId = (int) $inn2->batting_team_id;

        if ($r2['runs'] > $r1['runs']) {
            $winnerId = $batSecondId;
        } elseif ($r2['runs'] < $r1['runs']) {
            $winnerId = $batFirstId;
        } else {
            $winnerId = null;
        }

        $winByRuns = null;
        $winByWickets = null;

        if ($winnerId !== null) {
            if ($winnerId === $batSecondId) {
                $winByWickets = max(0, $maxWickets - $r2['wickets']);
            } else {
                $winByRuns = max(0, $r1['runs'] - $r2['runs']);
            }
        }

        $match->update([
            'status' => MatchStatusEnum::COMPLETED,
            'winning_team_id' => $winnerId,
            'win_by_runs' => $winByRuns,
            'win_by_wickets' => $winByWickets,
        ]);
        // §30.8: graphic command history is preserved on completion so the
        // broadcast operator can re-send post-match graphics without rebuilding
        // the full command list.  Use PurgeOldMatchGraphicCommands artisan
        // command for scheduled cleanup instead.
    }

    /**
     * @return Collection<int, Ball>
     */
    private function orderedBalls(Innings $innings): Collection
    {
        return $innings->balls()->get();
    }

    /**
     * Full innings totals via {@see InningsStatsService::compute()} — single source for
     * runs, wickets, and legal-ball count (replaces the old simplified totalsFromBalls).
     *
     * @return array{runs: int, wickets: int, valid_deliveries: int}
     */
    private function inningsTotals(TournamentMatch $match, Innings $innings, Collection $balls): array
    {
        $stats = $this->inningsStats->compute(
            $balls,
            InningsStatsService::namesFromRelations($balls),
        );
        $cross = InningsStatsService::crossInningsPenaltyRunsForBattingTeam($match, (int) $innings->batting_team_id);
        $stats = InningsStatsService::applyCrossInningsPenalties($stats, $cross);

        return [
            'runs' => (int) $stats['total_runs'],
            'wickets' => (int) $stats['total_wickets'],
            'valid_deliveries' => (int) $stats['legal_balls'],
        ];
    }

    /**
     * @param  Collection<int, Ball>  $balls
     */
    private function shouldCompleteInnings(
        TournamentMatch $match,
        Innings $innings,
        Collection $balls,
        int $maxWickets,
        int $oversLimit,
        ?int $chaseTarget,
        bool $isSecondInnings,
    ): bool {
        if ($balls->isEmpty()) {
            return false;
        }

        $t = $this->inningsTotals($match, $innings, $balls);

        if ($maxWickets > 0 && $t['wickets'] >= $maxWickets) {
            return true;
        }

        if ($t['valid_deliveries'] >= $oversLimit * 6) {
            return true;
        }

        if ($isSecondInnings && $chaseTarget !== null && $t['runs'] >= $chaseTarget) {
            return true;
        }

        return false;
    }

    /** Innings ended via organizer action (InningsLifecycleService) — do not auto-revert. */
    private function isManuallyEnded(Innings $innings): bool
    {
        return $innings->end_reason !== null;
    }
}
