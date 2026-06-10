<?php

namespace App\Services;

use App\Models\TournamentMatch;
use Illuminate\Support\Facades\DB;

/**
 * Players who already appear on ball records for a team in a match.
 * Used to guard mid-match squad / playing-eleven edits.
 */
class MatchParticipationService
{
    /**
     * @return list<int>
     */
    public function participatedPlayerIds(TournamentMatch $match, int $teamId): array
    {
        // Single query: join innings to scope by match + team, then collect all
        // player FK columns in one pass — avoids N+1 (previously 6 queries per call).
        $rows = DB::table('balls')
            ->join('innings', 'innings.id', '=', 'balls.innings_id')
            ->where('innings.match_id', $match->id)
            ->where(function ($q) use ($teamId) {
                $q->where('innings.batting_team_id', $teamId)
                    ->orWhere('innings.bowling_team_id', $teamId);
            })
            ->get([
                'balls.striker_id',
                'balls.non_striker_id',
                'balls.out_player_id',
                'balls.bowler_id',
                'balls.fielder_id',
                'innings.batting_team_id',
                'innings.bowling_team_id',
            ]);

        $ids = [];
        foreach ($rows as $row) {
            $isBatting = (int) $row->batting_team_id === $teamId;
            $isBowling = (int) $row->bowling_team_id === $teamId;

            if ($isBatting) {
                foreach (['striker_id', 'non_striker_id', 'out_player_id'] as $col) {
                    if ($row->$col !== null) {
                        $ids[] = (int) $row->$col;
                    }
                }
            }

            if ($isBowling) {
                foreach (['bowler_id', 'fielder_id'] as $col) {
                    if ($row->$col !== null) {
                        $ids[] = (int) $row->$col;
                    }
                }
            }
        }

        return array_values(array_unique($ids));
    }

    public function matchHasBalls(TournamentMatch $match): bool
    {
        return DB::table('balls')
            ->join('innings', 'innings.id', '=', 'balls.innings_id')
            ->where('innings.match_id', $match->id)
            ->exists();
    }
}
