<?php

namespace App\Http\Controllers\User;

use App\Enums\Tournament\TournamentTypeEnum;
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
}
