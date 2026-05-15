<?php

namespace App\Http\Controllers\User;

use App\Enums\Event\TossChoiceEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateMatchTossRequest;
use App\Http\Resources\User\TournamentMatchResource;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;

class MatchTossController extends Controller
{
    use BaseControllerTrait;

    /**
     * Record toss for a match (Step 6 in tournament_flow).
     *
     * Only organizers. Winning team must be home or away in this match.
     */
    public function update(UpdateMatchTossRequest $request, TournamentMatch $match): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canOperateTournamentInApp($match->tournament)) {
            return $this->forbidden('You cannot record the toss for this match.');
        }

        $winningTeamId = (int) $request->validated('winning_team_id');
        if (! in_array($winningTeamId, [$match->home_team_id, $match->away_team_id], true)) {
            return $this->forbidden('Winning team must be one of the match teams (home or away).');
        }

        $chose = $request->validated('chose_to_bat_or_bowl');
        $match->update([
            'toss_winner_team_id' => $winningTeamId,
            'chose_to_bat_or_bowl' => $chose,
            'status' => 'toss_done',
        ]);

        $otherTeamId = $match->home_team_id === $winningTeamId ? $match->away_team_id : $match->home_team_id;
        $battingFirst = $chose === TossChoiceEnum::BAT->value;
        $innings1Batting = $battingFirst ? $winningTeamId : $otherTeamId;
        $innings1Bowling = $battingFirst ? $otherTeamId : $winningTeamId;

        if ($match->innings()->count() === 0) {
            $match->innings()->createMany([
                [
                    'innings_number' => 1,
                    'batting_team_id' => $innings1Batting,
                    'bowling_team_id' => $innings1Bowling,
                    'status' => 'not_started',
                ],
                [
                    'innings_number' => 2,
                    'batting_team_id' => $innings1Bowling,
                    'bowling_team_id' => $innings1Batting,
                    'status' => 'not_started',
                ],
            ]);
        }

        $match->load(['homeTeam', 'awayTeam', 'winningTeam', 'tossWinnerTeam', 'innings', 'playerOfMatch']);

        return $this->success(
            new TournamentMatchResource($match),
            'Toss recorded.'
        );
    }
}
