<?php

namespace App\Services\Broadcast;

use App\Enums\Event\MatchStatusEnum;
use App\Models\Ball;
use App\Models\TournamentMatch;
use Illuminate\Support\Collection;

/**
 * Estimates chase win % from historical "similar situations" in the same tournament.
 *
 * Situation buckets use: runs still needed, legal balls left, wickets in hand
 * (after each ball of past 2nd innings).  Win rate ≈ wins in matching buckets /
 * samples, blended with a light heuristic when data is thin.
 */
final class WinProbabilitySimilarSituationsService
{
    private const HISTORIC_MATCH_LIMIT = 100;

    private const MIN_SAMPLES_EXACT = 6;

    private const MIN_SAMPLES_BLENDED = 10;

    /**
     * @return array{home: int, away: int} Integer percentages summing to 100.
     */
    public function estimate(
        TournamentMatch $match,
        int $secondTotalWickets,
        string $battingTeamKey,
        ?int $runsToWin,
        ?int $ballsRemaining,
        float $currentRunRate,
        float $requiredRunRate,
    ): array {
        $maxWickets = max(1, (int) ($match->players_per_side ?: 11) - 1);

        if ($runsToWin !== null && $runsToWin <= 0) {
            return $this->fromBattingWinPct($battingTeamKey, 0.995);
        }

        if ($ballsRemaining !== null && $ballsRemaining <= 0 && $runsToWin !== null && $runsToWin > 0) {
            return $this->fromBattingWinPct($battingTeamKey, 0.005);
        }

        if ($runsToWin === null || $ballsRemaining === null) {
            return ['home' => 50, 'away' => 50];
        }

        $wicketsLeft = max(0, $maxWickets - $secondTotalWickets);
        $targetBucket = $this->bucketIndices($runsToWin, $ballsRemaining, $wicketsLeft);
        $bucketSamples = $this->collectHistoricalSamples($match);

        $pHist = $this->probabilityFromBuckets($bucketSamples, $targetBucket);
        $pHeur = $this->heuristicWinProbability(
            $runsToWin,
            $ballsRemaining,
            $wicketsLeft,
            $maxWickets,
            $currentRunRate,
            $requiredRunRate,
        );

        $bucketKey = $this->bucketKey($targetBucket);
        $nExact = count($bucketSamples[$bucketKey] ?? []);

        if ($pHist === null) {
            $p = $pHeur;
        } else {
            $weight = match (true) {
                $nExact >= self::MIN_SAMPLES_EXACT => 1.0,
                $nExact > 0 => min(1.0, $nExact / (float) self::MIN_SAMPLES_EXACT),
                default => 0.55,
            };
            $p = ($weight * $pHist) + ((1.0 - $weight) * $pHeur);
        }

        return $this->fromBattingWinPct($battingTeamKey, $p);
    }

    /**
     * @param  array<string, list<float>>  $bucketSamples  bucket key → list of 0.0|1.0 outcomes
     * @param  array{r:int,b:int,w:int}  $targetBucket
     */
    private function probabilityFromBuckets(array $bucketSamples, array $targetBucket): ?float
    {
        $key = $this->bucketKey($targetBucket);
        $xs = $bucketSamples[$key] ?? [];

        if (count($xs) >= self::MIN_SAMPLES_EXACT) {
            return $this->mean($xs);
        }

        $neighbour = [];
        foreach ($bucketSamples as $k => $vals) {
            $parsed = $this->parseBucketKey($k);
            if ($parsed === null) {
                continue;
            }
            $dist = abs($parsed['r'] - $targetBucket['r'])
                + abs($parsed['b'] - $targetBucket['b'])
                + abs($parsed['w'] - $targetBucket['w']);
            if ($dist <= 1) {
                foreach ($vals as $v) {
                    $neighbour[] = $v;
                }
            }
        }

        if (count($neighbour) >= self::MIN_SAMPLES_BLENDED) {
            return $this->mean($neighbour);
        }

        $all = [];
        foreach ($bucketSamples as $vals) {
            foreach ($vals as $v) {
                $all[] = $v;
            }
        }

        if (count($all) >= self::MIN_SAMPLES_BLENDED) {
            return $this->mean($all);
        }

        return count($xs) > 0 ? $this->mean($xs) : null;
    }

    private function heuristicWinProbability(
        int $runsToWin,
        int $ballsRemaining,
        int $wicketsLeft,
        int $maxWickets,
        float $currentRunRate,
        float $requiredRunRate,
    ): float {
        $runsPerOverNeeded = $ballsRemaining > 0
            ? ($runsToWin / ($ballsRemaining / 6.0))
            : 36.0;

        $rrEdge = $currentRunRate - $requiredRunRate;
        if ($requiredRunRate <= 0 && $runsToWin > 0) {
            $rrEdge = $currentRunRate - $runsPerOverNeeded;
        }

        $wicketComfort = ($wicketsLeft / max(1.0, (float) $maxWickets)) * 0.9;
        $pressure = min(2.5, $runsPerOverNeeded / 12.0);

        $x = 0.32 * $rrEdge + 0.22 * $wicketComfort - 0.35 * $pressure;

        return max(0.04, min(0.96, 1.0 / (1.0 + exp(-$x))));
    }

    /**
     * @return array<string, list<float>>
     */
    private function collectHistoricalSamples(TournamentMatch $match): array
    {
        $tid = (int) $match->tournament_id;
        $oid = (int) $match->overs;
        $mid = (int) $match->id;

        /** @var Collection<int, TournamentMatch> $historic */
        $historic = TournamentMatch::query()
            ->where('tournament_id', $tid)
            ->where('id', '!=', $mid)
            ->where('status', MatchStatusEnum::COMPLETED)
            ->where('is_no_result', false)
            ->whereNotNull('winning_team_id')
            ->where('overs', $oid)
            ->orderByDesc('id')
            ->limit(self::HISTORIC_MATCH_LIMIT)
            ->with([
                'innings' => fn ($q) => $q->orderBy('innings_number'),
                'innings.balls' => fn ($q) => $q->orderBy('over')->orderBy('ball_in_over')->orderBy('id'),
            ])
            ->get();

        $out = [];

        foreach ($historic as $m) {
            $inn1 = $m->innings->firstWhere('innings_number', 1);
            $inn2 = $m->innings->firstWhere('innings_number', 2);
            if (! $inn1 || ! $inn2 || $inn1->balls->isEmpty() || $inn2->balls->isEmpty()) {
                continue;
            }

            $t = (int) $inn1->balls->sum('runs') + 1;
            if ($t < 1) {
                continue;
            }

            $chaseTeamId = (int) $inn2->batting_team_id;
            $won = (int) $m->winning_team_id === $chaseTeamId;
            $outcome = $won ? 1.0 : 0.0;

            $mMaxBalls = (int) $m->overs * 6;
            $mMaxWickets = max(1, (int) ($m->players_per_side ?: 11) - 1);

            $state = ['totalRuns' => 0, 'legalBalls' => 0, 'totalWickets' => 0];
            $seen = [];

            foreach ($inn2->balls as $ball) {
                $state = $this->applyBall($ball, $state);

                $runsNeeded = max(0, $t - $state['totalRuns']);
                $ballsLeft = max(0, $mMaxBalls - $state['legalBalls']);
                $wktsLeft = max(0, $mMaxWickets - $state['totalWickets']);

                if ($runsNeeded <= 0) {
                    break;
                }

                $b = $this->bucketIndices($runsNeeded, $ballsLeft, $wktsLeft);
                $k = $this->bucketKey($b);
                if (isset($seen[$k])) {
                    continue;
                }
                $seen[$k] = true;
                $out[$k][] = $outcome;
            }
        }

        return $out;
    }

    /**
     * @return array{totalRuns:int, legalBalls:int, totalWickets:int}
     */
    private function applyBall(Ball $ball, array $state): array
    {
        $isLegal = $ball->isLegalDelivery();
        $ballRuns = (int) ($ball->runs ?? 0) + (int) ($ball->penalty_runs ?? 0);
        $state['totalRuns'] += $ballRuns;
        if ($isLegal) {
            $state['legalBalls']++;
        }
        if ($ball->is_wicket && $ball->dismissal_type?->value !== 'retired_hurt') {
            $state['totalWickets']++;
        }

        return $state;
    }

    /**
     * @return array{r:int,b:int,w:int}
     */
    private function bucketIndices(int $runsNeeded, int $ballsLeft, int $wicketsLeft): array
    {
        $r = match (true) {
            $runsNeeded <= 0 => 0,
            $runsNeeded <= 12 => 1,
            $runsNeeded <= 30 => 2,
            $runsNeeded <= 48 => 3,
            default => 4,
        };
        $b = match (true) {
            $ballsLeft <= 0 => 0,
            $ballsLeft <= 12 => 1,
            $ballsLeft <= 36 => 2,
            $ballsLeft <= 72 => 3,
            default => 4,
        };
        $w = match (true) {
            $wicketsLeft <= 2 => 0,
            $wicketsLeft <= 5 => 1,
            $wicketsLeft <= 8 => 2,
            default => 3,
        };

        return ['r' => $r, 'b' => $b, 'w' => $w];
    }

    /**
     * @param  array{r:int,b:int,w:int}  $b
     */
    private function bucketKey(array $b): string
    {
        return "{$b['r']}:{$b['b']}:{$b['w']}";
    }

    /**
     * @return array{r:int,b:int,w:int}|null
     */
    private function parseBucketKey(string $key): ?array
    {
        $parts = explode(':', $key);
        if (count($parts) !== 3) {
            return null;
        }

        return [
            'r' => (int) $parts[0],
            'b' => (int) $parts[1],
            'w' => (int) $parts[2],
        ];
    }

    /**
     * @param  list<float>  $xs
     */
    private function mean(array $xs): float
    {
        if ($xs === []) {
            return 0.5;
        }

        return array_sum($xs) / count($xs);
    }

    private function fromBattingWinPct(string $battingTeamKey, float $battingWinPct): array
    {
        $battingWinPct = max(0.0, min(1.0, $battingWinPct));
        $h = (int) round($battingWinPct * 100);
        $h = max(0, min(100, $h));
        $a = 100 - $h;

        if ($battingTeamKey === 'home') {
            return ['home' => $h, 'away' => $a];
        }

        return ['home' => $a, 'away' => $h];
    }
}
