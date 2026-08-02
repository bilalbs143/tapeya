<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Compact live cricket score row for the Home Live Score slider.
 *
 * @mixin array<string, mixed>
 */
class LiveScoreResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var array<string, mixed> $row */
        $row = $this->resource;

        return [
            'id' => $row['id'],
            'tournament_id' => $row['tournament_id'],
            'status' => $row['status'],
            'match_label' => $row['match_label'],
            'overs_limit' => $row['overs_limit'],
            'home_team' => $row['home_team'],
            'away_team' => $row['away_team'],
            'tournament' => $row['tournament'],
            'innings' => $row['innings'],
            'active_innings' => $row['active_innings'],
            'commentary' => $row['commentary'],
            'updated_at' => $row['updated_at'],
        ];
    }
}
