<?php

namespace App\Http\Controllers\User;

use App\Enums\Event\MatchStatusEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateMatchPlayerOfMatchRequest;
use App\Http\Resources\User\TournamentMatchResource;
use App\Jobs\SyncMatchGraphicContextJob;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MatchPlayerOfMatchController extends Controller
{
    use BaseControllerTrait;

    /**
     * Set or clear Man of the Match after the fixture is completed.
     */
    public function update(UpdateMatchPlayerOfMatchRequest $request, TournamentMatch $match): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canOperateMatchInApp($match)) {
            return $this->forbidden('You cannot update this match.');
        }

        $match->refresh();

        if ($match->status !== MatchStatusEnum::COMPLETED) {
            return $this->failure('Man of the match can only be set for a completed match.', 'INVALID_STATE');
        }

        $userId = $request->validated('player_of_match_user_id');

        if ($userId !== null) {
            if (! $this->userIsEligible($match, (int) $userId)) {
                return $this->failure(
                    'That player is not on the playing eleven for an eligible team in this match.',
                    'VALIDATION_ERROR'
                );
            }
        }

        $match->update(['player_of_match_user_id' => $userId]);
        $match->load(['homeTeam', 'awayTeam', 'winningTeam', 'tossWinnerTeam', 'playerOfMatch', 'stream']);

        SyncMatchGraphicContextJob::dispatch($match->id);

        return $this->success(
            new TournamentMatchResource($match),
            $userId !== null ? 'Man of the match saved.' : 'Man of the match cleared.'
        );
    }

    private function userIsEligible(TournamentMatch $match, int $userId): bool
    {
        // Man of the Match may come from either team — no winner restriction.
        return DB::table('match_players')
            ->where('match_id', $match->id)
            ->where('user_id', $userId)
            ->whereIn('team_id', [(int) $match->home_team_id, (int) $match->away_team_id])
            ->exists();
    }
}
