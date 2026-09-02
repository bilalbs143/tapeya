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

            'sponsor' => $team->sponsor,
            'icon_players' => $team->icon_players,

            'owner_id' => $team->user_id,
            'owner' => $this->whenLoaded('owner', fn () => new UserResource($team->owner)),

            'created_by' => $team->created_by,
            'creator' => $this->whenLoaded('creator', fn () => new UserResource($team->creator)),

            'group_index' => $this->when(isset($team->pivot), fn () => $team->pivot->group_index),

            'created_at' => $team->created_at?->toIso8601String(),
            'updated_at' => $team->updated_at?->toIso8601String(),
        ];
    }
}
