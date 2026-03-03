<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PlayerStatsService;
use Illuminate\Http\JsonResponse;

class RankingController extends Controller
{
    use BaseControllerTrait;

    /**
     * Leaderboard / rankings (per player_stats_schema: Open Tournament or any tournament type).
     *
     * Query: tournament_type = league | open_tournament | emerging (required for ranking)
     *        category = batting | bowling | fielding
     *        sort = runs | average | strike_rate | wickets | economy | catches | run_outs | stumpings (or short: ave, sr, econ, ct, ro, st)
     *        min_innings = optional minimum innings (batting) or matches (bowling) to qualify
     */
    public function index(): JsonResponse
    {
        $tournamentType = request()->query('tournament_type', 'open_tournament');
        $category = request()->query('category', 'batting');
        $sort = request()->query('sort', $category === 'batting' ? 'runs' : ($category === 'bowling' ? 'wickets' : 'ct'));
        $minInnings = (int) request()->query('min_innings', 0);

        $validTournamentType = ['league', 'open_tournament', 'emerging'];
        if (! in_array($tournamentType, $validTournamentType, true)) {
            return $this->failure('tournament_type must be one of: league, open_tournament, emerging.');
        }
        $validCategory = ['batting', 'bowling', 'fielding'];
        if (! in_array($category, $validCategory, true)) {
            return $this->failure('category must be one of: batting, bowling, fielding.');
        }

        $service = app(PlayerStatsService::class);
        $rankings = $service->rankings($tournamentType, $category, $sort, $minInnings);

        $userIds = array_column($rankings, 'player_id');
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');

        $list = [];
        $rank = 1;
        foreach ($rankings as $row) {
            $u = $users->get($row['player_id']);
            $list[] = [
                'rank' => $rank++,
                'player_id' => $row['player_id'],
                'player' => $u ? ['id' => $u->id, 'name' => $u->name] : null,
                'stats' => $row['stats'],
            ];
        }

        return $this->success([
            'tournament_type' => $tournamentType,
            'category' => $category,
            'sort' => $sort,
            'rankings' => $list,
        ]);
    }
}
