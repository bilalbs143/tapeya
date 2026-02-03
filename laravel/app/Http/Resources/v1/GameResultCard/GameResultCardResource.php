<?php

namespace App\Http\Resources\v1\GameResultCard;

use App\Utils\Services\Utils;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameResultCardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => Utils::resolveProperty($this->user?->name, 'VIEW_PROPERTY_NAME', Utils::isMyResource($this->user?->id)),
            'company' => $this->company?->name,
            'provider' => $this->provider?->name,
            'game' => $this->game?->name,
            'type' => $this->type?->label(),
            'type_enum' => $this->type?->name,
            'status' => $this->status?->label(),
            'status_enum' => $this->status?->name,
            'data' => $this->data,
            'fetched_at' => $this->fetched_at,
            'created_at' => $this->created_at,
        ];
    }
}
