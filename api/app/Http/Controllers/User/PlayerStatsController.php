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

class PlayerStatsController extends Controller
{
    use BaseControllerTrait;

    /**
     * Accumulative stats for a player (profile), optionally by tournament_type and cricket_format.
     *
     * Query: tournament_type = league | open_tournament | emerging | all (default: all)
     *        cricket_format = hard_ball | tape_ball | tennis_ball | hard_tennis | all (default: all)
     */
    public function show(User $user): JsonResponse
    {
        try {
            $bucket = StatBucketFilters::fromProfileQuery(
                request()->query('tournament_type', 'all'),
                request()->query('cricket_format', 'all'),
            );
        } catch (InvalidArgumentException $e) {
            return $this->failure($e->getMessage());
        }

        $service = app(PlayerStatsService::class);

        $data = [
            'player_id' => $user->id,
            'tournament_type' => $bucket['tournamentTypeQuery'],
            'cricket_format' => $bucket['cricketFormatQuery'],
            'batting' => $service->battingForPlayer($user->id, $bucket['tournamentType'], $bucket['cricketFormat']),
            'bowling' => $service->bowlingForPlayer($user->id, $bucket['tournamentType'], $bucket['cricketFormat']),
            'fielding' => $service->fieldingForPlayer($user->id, $bucket['tournamentType'], $bucket['cricketFormat']),
        ];

        return $this->success($data);
    }

    /**
     * Where this player sits on a leaderboard (same rules as GET /rankings).
     *
     * Query: tournament_type, cricket_format, category, sort, min_innings (qualification threshold)
     */
    public function rankingPosition(User $user): JsonResponse
    {
        $tournamentType = request()->query('tournament_type', 'open_tournament');
        $cricketFormat = request()->query('cricket_format', 'all');
        $minQualifyingCount = (int) request()->query('min_innings', 0);

        try {
            $bucket = StatBucketFilters::fromRankingsQuery($tournamentType, $cricketFormat);
            $categoryEnum = StatBucketFilters::parseCategoryOptional(
                request()->query('category'),
                StatCategoryEnum::defaultForPlayingRole($user->playing_role),
            );
        } catch (InvalidArgumentException $e) {
            return $this->failure($e->getMessage());
        }

        $sort = request()->query('sort') ?: $categoryEnum->defaultSort();

        $rank = app(PlayerStatsService::class)->rankPositionForPlayer(
            (int) $user->id,
            $tournamentType,
            $categoryEnum->value,
            $sort,
            $minQualifyingCount,
            $cricketFormat
        );

        return $this->success([
            'rank' => $rank,
            'tournament_type' => $tournamentType,
            'cricket_format' => $cricketFormat,
            'category' => $categoryEnum->value,
            'sort' => $sort,
        ]);
    }
}
