<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TournamentMatchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $match = $this->resource;

        return [
            'id' => $match->id,
            'tournament_id' => $match->tournament_id,
            'group_index' => $match->group_index,
            'match_date' => $match->match_date?->format('Y-m-d'),
            'match_time' => $match->match_time,
            'venue_name' => $match->venue_name,
            'players_per_side' => $match->players_per_side,
            'overs' => $match->overs,
            'status' => $match->status?->value,
            'status_label' => $match->status?->label(),

            'home_team_id' => $match->home_team_id,
            'away_team_id' => $match->away_team_id,
            'home_team' => $this->whenLoaded('homeTeam', fn () => new TeamResource($match->homeTeam)),
            'away_team' => $this->whenLoaded('awayTeam', fn () => new TeamResource($match->awayTeam)),
            'tournament' => $this->whenLoaded('tournament', fn () => [
                'id' => $match->tournament->id,
                'name' => $match->tournament->tournament_name ?? '',
                'logo_url' => null,
            ]),

            'winning_team_id' => $match->winning_team_id,
            'toss_winner_team_id' => $match->toss_winner_team_id,
            'chose_to_bat_or_bowl' => $match->chose_to_bat_or_bowl,
            'is_no_result' => (bool) ($match->is_no_result ?? false),
            'winning_team' => $this->whenLoaded('winningTeam', fn () => new TeamResource($match->winningTeam)),
            'toss_winner_team' => $this->whenLoaded('tossWinnerTeam', fn () => new TeamResource($match->tossWinnerTeam)),

            'win_by_runs' => $match->win_by_runs !== null ? (int) $match->win_by_runs : null,
            'win_by_wickets' => $match->win_by_wickets !== null ? (int) $match->win_by_wickets : null,
            'player_of_match_user_id' => $match->player_of_match_user_id !== null
                ? (int) $match->player_of_match_user_id
                : null,
            'player_of_match' => $this->whenLoaded('playerOfMatch', function () use ($match) {
                if (! $match->playerOfMatch) {
                    return null;
                }
                $u = $match->playerOfMatch;

                return [
                    'id' => (int) $u->id,
                    'name' => $u->name ?: $u->nickname ?: 'Player',
                ];
            }),
            'result_summary' => $match->resultSummary(),

            'created_at' => $match->created_at?->toIso8601String(),
            'updated_at' => $match->updated_at?->toIso8601String(),
        ];
    }
}
