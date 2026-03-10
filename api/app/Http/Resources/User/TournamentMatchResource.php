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
            'match_date' => $match->match_date?->format('Y-m-d'),
            'match_time' => $match->match_time,
            'venue_name' => $match->venue_name,
            'players_per_side' => $match->players_per_side,
            'overs' => $match->overs,
            'status' => $match->status,

            'home_team_id' => $match->home_team_id,
            'away_team_id' => $match->away_team_id,
            'home_team' => $this->whenLoaded('homeTeam', fn () => new TeamResource($match->homeTeam)),
            'away_team' => $this->whenLoaded('awayTeam', fn () => new TeamResource($match->awayTeam)),

            'winning_team_id' => $match->winning_team_id,
            'chose_to_bat_or_bowl' => $match->chose_to_bat_or_bowl,
            'winning_team' => $this->whenLoaded('winningTeam', fn () => new TeamResource($match->winningTeam)),

            'created_at' => $match->created_at?->toIso8601String(),
            'updated_at' => $match->updated_at?->toIso8601String(),
        ];
    }
}
