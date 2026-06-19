<?php

namespace App\Services\Broadcast;

use App\Models\PlayerMatchBatting;
use App\Models\PlayerMatchBowling;
use App\Models\TournamentMatch;

/**
 * Tournament-wide totals for Tour Hit overlay graphics.
 */
final class TournamentGraphicAggregatesService
{
    /**
     * @return array{
     *   total_runs: int,
     *   total_fours: int,
     *   total_sixes: int,
     *   total_fifties: int,
     *   total_centuries: int,
     *   total_wickets: int
     * }
     */
    public function buildForTournament(int $tournamentId): array
    {
        $empty = [
            'total_runs' => 0,
            'total_fours' => 0,
            'total_sixes' => 0,
            'total_fifties' => 0,
            'total_centuries' => 0,
            'total_wickets' => 0,
        ];

        if ($tournamentId <= 0) {
            return $empty;
        }

        $matchIds = TournamentMatch::query()
            ->where('tournament_id', $tournamentId)
            ->pluck('id')
            ->all();

        if ($matchIds === []) {
            return $empty;
        }

        $batting = PlayerMatchBatting::query()
            ->whereIn('match_id', $matchIds)
            ->selectRaw('COALESCE(SUM(runs), 0) AS total_runs')
            ->selectRaw('COALESCE(SUM(fours), 0) AS total_fours')
            ->selectRaw('COALESCE(SUM(sixes), 0) AS total_sixes')
            ->selectRaw('COALESCE(SUM(fifties), 0) AS total_fifties')
            ->selectRaw('COALESCE(SUM(hundreds), 0) AS total_centuries')
            ->first();

        $wickets = (int) PlayerMatchBowling::query()
            ->whereIn('match_id', $matchIds)
            ->sum('wickets');

        return [
            'total_runs' => (int) ($batting->total_runs ?? 0),
            'total_fours' => (int) ($batting->total_fours ?? 0),
            'total_sixes' => (int) ($batting->total_sixes ?? 0),
            'total_fifties' => (int) ($batting->total_fifties ?? 0),
            'total_centuries' => (int) ($batting->total_centuries ?? 0),
            'total_wickets' => $wickets,
        ];
    }
}
