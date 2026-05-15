<?php

namespace App\Services;

use App\Enums\Event\MatchStatusEnum;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\TournamentMatch;
use App\Services\Broadcast\MatchGraphicCommandHistoryService;
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
        private readonly MatchGraphicCommandHistoryService $graphicCommandHistory,
    ) {}

    public function evaluate(TournamentMatch $match): void
    {
        if ($match->status === MatchStatusEnum::CANCELLED) {
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

        $balls1 = $this->orderedBalls($inn1);
        $balls2 = $this->orderedBalls($inn2);

        $hasBalls1 = $balls1->isNotEmpty();
        $hasBalls2 = $balls2->isNotEmpty();

        $inn1ShouldComplete = $this->shouldCompleteInnings(
            $balls1,
            $maxWickets,
            $oversLimit,
            null,
            false,
        );

        if ($inn1ShouldComplete) {
            if ($inn1->status !== 'completed') {
                $inn1->update(['status' => 'completed']);
            }
        } elseif ($inn1->status === 'completed') {
            $inn1->update(['status' => $hasBalls1 ? 'in_progress' : 'not_started']);
        }

        $inn1->refresh();

        $balls1 = $this->orderedBalls($inn1);
        $inn1IsComplete = $inn1->status === 'completed';
        $firstRuns = $inn1IsComplete ? $this->totalsFromBalls($balls1)['runs'] : 0;

        $inn2ShouldComplete = $inn1IsComplete && $this->shouldCompleteInnings(
            $balls2,
            $maxWickets,
            $oversLimit,
            $firstRuns,
            true,
        );

        if ($inn2ShouldComplete) {
            if ($inn2->status !== 'completed') {
                $inn2->update(['status' => 'completed']);
            }
        } elseif ($inn2->status === 'completed') {
            $inn2->update(['status' => $hasBalls2 ? 'in_progress' : 'not_started']);
        }

        $inn1->refresh();
        $inn2->refresh();

        if ($inn1->status !== 'completed' || $inn2->status !== 'completed') {
            if ($match->status === MatchStatusEnum::COMPLETED) {
                $match->update([
                    'status' => MatchStatusEnum::IN_PROGRESS,
                    'winning_team_id' => $match->toss_winner_team_id,
                    'win_by_runs' => null,
                    'win_by_wickets' => null,
                    'player_of_match_user_id' => null,
                ]);
            }

            return;
        }

        $r1 = $this->totalsFromBalls($this->orderedBalls($inn1));
        $r2 = $this->totalsFromBalls($this->orderedBalls($inn2));

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

        $wasCompleted = $match->status === MatchStatusEnum::COMPLETED;

        $match->update([
            'status' => MatchStatusEnum::COMPLETED,
            'winning_team_id' => $winnerId,
            'win_by_runs' => $winByRuns,
            'win_by_wickets' => $winByWickets,
        ]);

        if (! $wasCompleted) {
            $this->graphicCommandHistory->clearForMatchIfSessionExists($match);
        }
    }

    /**
     * @return Collection<int, Ball>
     */
    private function orderedBalls(Innings $innings): Collection
    {
        return $innings->balls()->get();
    }

    /**
     * @return array{runs: int, wickets: int, valid_deliveries: int}
     */
    private function totalsFromBalls(Collection $balls): array
    {
        $runs = (int) $balls->sum(fn (Ball $b) => (int) ($b->runs ?? 0) + (int) ($b->penalty_runs ?? 0));
        $wickets = $balls->where('is_wicket', true)->count();
        $validDeliveries = $balls->filter(fn (Ball $b) => $b->isLegalDelivery())->count();

        return [
            'runs' => $runs,
            'wickets' => $wickets,
            'valid_deliveries' => $validDeliveries,
        ];
    }

    /**
     * @param  Collection<int, Ball>  $balls
     */
    private function shouldCompleteInnings(
        Collection $balls,
        int $maxWickets,
        int $oversLimit,
        ?int $firstInningsRuns,
        bool $isSecondInnings,
    ): bool {
        if ($balls->isEmpty()) {
            return false;
        }

        $t = $this->totalsFromBalls($balls);

        if ($maxWickets > 0 && $t['wickets'] >= $maxWickets) {
            return true;
        }

        if ($t['valid_deliveries'] >= $oversLimit * 6) {
            return true;
        }

        if ($isSecondInnings && $firstInningsRuns !== null && $t['runs'] > $firstInningsRuns) {
            return true;
        }

        return false;
    }
}
