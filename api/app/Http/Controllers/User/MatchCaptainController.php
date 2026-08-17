<?php

namespace App\Http\Controllers\User;

use App\Events\Scoring\MatchStateUpdated;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateMatchCaptainRequest;
use App\Models\TournamentMatch;
use App\Services\MatchStateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MatchCaptainController extends Controller
{
    use BaseControllerTrait;

    /**
     * Set the designated captain for a team in this match.
     *
     * PATCH /matches/{match}/captain
     */
    public function update(UpdateMatchCaptainRequest $request, TournamentMatch $match, MatchStateService $matchStateService): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canOperateMatchInApp($match)) {
            return $this->forbidden('You cannot manage this match.');
        }

        $teamId = (int) $request->validated('team_id');
        $captainId = (int) $request->validated('captain_id');

        if (! in_array($teamId, [(int) $match->home_team_id, (int) $match->away_team_id], true)) {
            return $this->forbidden('Team does not belong to this match.');
        }

        $inSquad = DB::table('match_squads')
            ->where('match_id', $match->id)
            ->where('team_id', $teamId)
            ->where('user_id', $captainId)
            ->exists();

        if (! $inSquad) {
            return $this->failure(
                'The captain must be in the match squad for this team.',
                'VALIDATION_ERROR',
            );
        }

        $now = now();

        DB::table('match_team_settings')->updateOrInsert(
            ['match_id' => $match->id, 'team_id' => $teamId],
            ['captain_id' => $captainId, 'updated_at' => $now, 'created_at' => $now],
        );

        $matchState = $matchStateService->build($match->fresh());
        MatchStateUpdated::dispatch($match->id, $matchState);

        return $this->success(
            [
                'match_id' => $match->id,
                'team_id' => $teamId,
                'captain_id' => $captainId,
                'match_state' => $matchState,
            ],
            'Captain updated.',
        );
    }
}
