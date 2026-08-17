<?php

namespace App\Services\Stats;

use App\Models\PlayerMatchBatting;
use App\Models\PlayerMatchBowling;
use App\Models\PlayerMatchFielding;
use App\Models\TournamentMatch;
use App\Services\PlayerStatsService;
use Illuminate\Support\Facades\DB;

/**
 * Recompute per-match batting / bowling / fielding rows for any match kind.
 */
final class PlayerMatchStatsWriter
{
    public function __construct(
        private readonly PlayerStatsService $service,
    ) {}

    /**
     * @return list<int> Player ids that have per-match rows after this write.
     */
    public function write(TournamentMatch $match): array
    {
        $matchId = (int) $match->id;
        $batting = $this->service->computeBattingForMatch($matchId);
        $bowling = $this->service->computeBowlingForMatch($matchId);
        $fielding = $this->service->computeFieldingForMatch($matchId);

        DB::transaction(function () use ($matchId, $batting, $bowling, $fielding) {
            PlayerMatchBatting::where('match_id', $matchId)->delete();
            PlayerMatchBowling::where('match_id', $matchId)->delete();
            PlayerMatchFielding::where('match_id', $matchId)->delete();

            $now = now();

            if ($batting !== []) {
                PlayerMatchBatting::insert(array_map(fn (array $row) => [
                    'player_id' => $row['player_id'],
                    'match_id' => $matchId,
                    'matches' => 1,
                    'innings' => $row['innings'],
                    'not_outs' => $row['not_outs'],
                    'runs' => $row['runs'],
                    'balls_faced' => $row['balls_faced'],
                    'fours' => $row['fours'],
                    'sixes' => $row['sixes'],
                    'dots' => $row['dots'],
                    'highest_score' => $row['highest_score'],
                    'hundreds' => $row['hundreds'],
                    'fifties' => $row['fifties'],
                    'average' => $row['average'],
                    'strike_rate' => $row['strike_rate'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ], $batting));
            }

            if ($bowling !== []) {
                PlayerMatchBowling::insert(array_map(fn (array $row) => [
                    'player_id' => $row['player_id'],
                    'match_id' => $matchId,
                    'matches' => 1,
                    'innings' => $row['innings'],
                    'overs' => $row['overs'],
                    'maidens' => $row['maidens'],
                    'runs_conceded' => $row['runs_conceded'],
                    'wickets' => $row['wickets'],
                    'no_balls' => $row['no_balls'],
                    'wides' => $row['wides'],
                    'best_bowling_innings' => $row['best_bowling_innings'],
                    'best_bowling_match' => $row['best_bowling_match'],
                    'five_wickets' => $row['five_wickets'],
                    'ten_wickets' => $row['ten_wickets'],
                    'average' => $row['average'],
                    'economy' => $row['economy'],
                    'strike_rate' => $row['strike_rate'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ], $bowling));
            }

            if ($fielding !== []) {
                PlayerMatchFielding::insert(array_map(fn (array $row) => [
                    'player_id' => $row['player_id'],
                    'match_id' => $matchId,
                    'matches' => 1,
                    'catches' => $row['catches'],
                    'run_outs' => $row['run_outs'],
                    'stumpings' => $row['stumpings'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ], $fielding));
            }
        });

        return collect($batting)->pluck('player_id')
            ->merge(collect($bowling)->pluck('player_id'))
            ->merge(collect($fielding)->pluck('player_id'))
            ->unique()
            ->values()
            ->all();
    }
}
