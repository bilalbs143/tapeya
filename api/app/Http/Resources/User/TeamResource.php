<?php

namespace App\Http\Resources\User;

use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $team = $this->resource;

        return [
            'id' => $team->id,
            'name' => $team->name,
            'logo' => MediaDisk::url($team->logo),
            'code' => $team->code,
            'country' => $team->country,
            'city' => $team->city,

            'sponsor_id' => $team->user_id,
            'sponsor' => $this->whenLoaded('sponsor', fn () => new UserResource($team->sponsor)),

            'created_by' => $team->created_by,
            'creator' => $this->whenLoaded('creator', fn () => new UserResource($team->creator)),

            'icon_player_ids' => $team->relationLoaded('iconPlayers')
                ? $team->iconPlayers->pluck('id')->values()->all()
                : [],
            'icon_players' => $this->whenLoaded('iconPlayers', fn () => UserResource::collection($team->iconPlayers)),

            'group_index' => $this->when(isset($team->pivot), fn () => $team->pivot->group_index),

            'created_at' => $team->created_at?->toIso8601String(),
            'updated_at' => $team->updated_at?->toIso8601String(),
        ];
    }
}
