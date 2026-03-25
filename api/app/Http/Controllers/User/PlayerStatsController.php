<?php

namespace App\Http\Controllers\User;

use App\Enums\Tournament\TournamentTypeEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PlayerStatsService;
use Illuminate\Http\JsonResponse;

class PlayerStatsController extends Controller
{
    use BaseControllerTrait;

    /**
     * Accumulative stats for a player (profile), optionally by tournament_type.
     *
     * Query: tournament_type = league | open_tournament | emerging | all (default: all)
     */
    public function show(User $user): JsonResponse
    {
        $tournamentType = request()->query('tournament_type', 'all');
        $valid = ['league', 'open_tournament', 'emerging', 'all'];
        if (! in_array($tournamentType, $valid, true)) {
            return $this->failure('Invalid tournament_type. Use: league, open_tournament, emerging, all.');
        }

        $et = $tournamentType === 'all' ? null : ($tournamentType === 'league' ? TournamentTypeEnum::LEAGUE : ($tournamentType === 'open_tournament' ? TournamentTypeEnum::OPEN_TOURNAMENT : TournamentTypeEnum::EMERGING));
        $service = app(PlayerStatsService::class);

        $data = [
            'player_id' => $user->id,
            'tournament_type' => $tournamentType,
            'batting' => $service->battingForPlayer($user->id, $et),
            'bowling' => $service->bowlingForPlayer($user->id, $et),
            'fielding' => $service->fieldingForPlayer($user->id, $et),
        ];

        return $this->success($data);
    }

    /**
     * Where this player sits on a leaderboard (same rules as GET /rankings).
     *
     * Query: tournament_type, category, sort, min_innings — defaults: open tournament;
     *          category + sort from the user's playing role when omitted (bowler → bowling/wickets, etc.).
     */
    public function rankingPosition(User $user): JsonResponse
    {
        $tournamentType = request()->query('tournament_type', 'open_tournament');
        $category = request()->query('category');
        if ($category === null || $category === '') {
            $category = match ($user->playing_role) {
                PlayingRoleEnum::BOWLER => 'bowling',
                PlayingRoleEnum::ALL_ROUNDER,
                PlayingRoleEnum::BATSMAN => 'batting',
                default => 'batting',
            };
        }

        $sort = request()->query('sort');
        if ($sort === null || $sort === '') {
            $sort = $category === 'batting' ? 'runs' : ($category === 'bowling' ? 'wickets' : 'ct');
        }
        $minInnings = (int) request()->query('min_innings', 0);

        $validTournamentType = ['league', 'open_tournament', 'emerging'];
        if (! in_array($tournamentType, $validTournamentType, true)) {
            return $this->failure('tournament_type must be one of: league, open_tournament, emerging.');
        }
        $validCategory = ['batting', 'bowling', 'fielding'];
        if (! in_array($category, $validCategory, true)) {
            return $this->failure('category must be one of: batting, bowling, fielding.');
        }

        $rank = app(PlayerStatsService::class)->rankPositionForPlayer(
            (int) $user->id,
            $tournamentType,
            $category,
            $sort,
            $minInnings
        );

        return $this->success([
            'rank' => $rank,
            'tournament_type' => $tournamentType,
            'category' => $category,
            'sort' => $sort,
        ]);
    }
}
