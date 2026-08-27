<?php

namespace App\Http\Resources\User;

use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuickMatchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $match = $this->resource;
        $creator = $match->createdBy;

        return [
            'id' => $match->id,
            'kind' => $match->kind?->value,
            'status' => $match->status?->value,
            'status_label' => $match->status?->label(),
            'cricket_format' => $match->cricket_format?->value,
            'cricket_format_label' => $match->cricket_format?->label(),
            'overs' => $match->overs,
            'players_per_side' => $match->players_per_side,
            'venue_name' => $match->venue_name,
            'match_date' => $match->match_date?->format('Y-m-d'),
            'match_time' => $match->match_time,
            'created_at' => $match->created_at?->toIso8601String(),
            'created_by' => $creator ? [
                'id' => (int) $creator->id,
                'name' => $creator->name ?: $creator->nickname,
            ] : null,
            'tournament' => $match->tournamentSummary(),
            'home_team' => $this->side($match->homeTeam),
            'away_team' => $this->side($match->awayTeam),
            'toss_winner_team_id' => $match->toss_winner_team_id !== null ? (int) $match->toss_winner_team_id : null,
            'chose_to_bat_or_bowl' => $match->chose_to_bat_or_bowl,
            'can_operate' => $request->user()?->canScoreMatchInApp($match) ?? false,
            'is_owner' => $request->user()?->isQuickMatchOwner($match) ?? false,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function side(mixed $team): ?array
    {
        if ($team === null) {
            return null;
        }

        $players = $team->relationLoaded('quickMatchPlayers')
            ? $team->quickMatchPlayers->map(fn ($user) => [
                'id' => (int) $user->id,
                'name' => $user->name,
                'nickname' => $user->nickname,
                'added_via_quick_match' => (bool) $user->added_via_quick_match,
            ])->values()->all()
            : [];

        return [
            'id' => (int) $team->id,
            'name' => $team->name,
            'user_id' => $team->user_id !== null ? (int) $team->user_id : null,
            'logo' => MediaDisk::url($team->logo),
            'players' => $players,
        ];
    }
}
