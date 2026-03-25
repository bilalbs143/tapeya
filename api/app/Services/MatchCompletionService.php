<?php

namespace App\Services;

use App\Enums\Event\MatchStatusEnum;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\TournamentMatch;
use Illuminate\Support\Collection;

/**
 * Marks innings and the match as completed from ball data, sets match winner for standings.
 * Re-evaluates on every change (including ball delete) so completion and winner can revert.
 *
 * Rules (aligned with organizer scoring): legal ball = not wide and not no-ball;
 * innings ends on max wickets, allocated overs exhausted, or (2nd innings only) runs > target.
 */
class MatchCompletionService
{
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

        $match->update([
            'status' => MatchStatusEnum::COMPLETED,
            'winning_team_id' => $winnerId,
        ]);
    }

    /**
     * @return Collection<int, Ball>
     */
    private function orderedBalls(Innings $innings): Collection
    {
        return $innings->balls()
            ->orderBy('over')
            ->orderBy('ball_in_over')
            ->get();
    }

    /**
     * @return array{runs: int, wickets: int, valid_deliveries: int}
     */
    private function totalsFromBalls(Collection $balls): array
    {
        // Batting total per innings: `runs` is the runs credited on that delivery from scoring
        // (extras, no-ball + runs, etc.). Do not add `penalty_runs` on top — that double-counts
        // if the same award is stored in both columns (organizer UI sends penalty_runs: 0).
        $runs = (int) $balls->sum('runs');
        $wickets = $balls->where('is_wicket', true)->count();
        $validDeliveries = $balls->filter(fn (Ball $b) => ! $b->is_wide && ! $b->is_no_ball)->count();

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
