<?php

namespace App\Http\Controllers\User;

use App\Enums\Stats\StatCategoryEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PlayerStatsService;
use App\Support\Stats\StatBucketFilters;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class RankingController extends Controller
{
    use BaseControllerTrait;

    /**
     * Leaderboard / rankings scoped by tournament_type.
     *
     * Query: tournament_type = open_tournament | private_tournament (required; no 'all')
     *        category = batting | bowling | fielding
     *        sort = runs | average | strike_rate | fours | sixes | wickets | economy | catches | run_outs | stumpings
     *        min_innings = optional qualification threshold (innings for batting, matches for bowling/fielding)
     */
    public function index(): JsonResponse
    {
        $tournamentType = request()->query('tournament_type', 'open_tournament');
        $minQualifyingCount = (int) request()->query('min_innings', 0);

        try {
            $bucket = StatBucketFilters::fromRankingsQuery($tournamentType);
            $categoryEnum = StatBucketFilters::parseCategoryOptional(
                request()->query('category'),
                StatCategoryEnum::BATTING,
            );
        } catch (InvalidArgumentException $e) {
            return $this->failure($e->getMessage());
        }

        $sort = request()->query('sort') ?: $categoryEnum->defaultSort();

        $service = app(PlayerStatsService::class);
        $rankings = $service->rankings($tournamentType, $categoryEnum->value, $sort, $minQualifyingCount);

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
            'tournament_type' => $bucket['tournamentTypeQuery'],
            'category' => $categoryEnum->value,
            'sort' => $sort,
            'rankings' => $list,
        ]);
    }
}
