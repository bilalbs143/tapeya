<?php

namespace App\Http\Resources\v1\User;

use App\Utils\Services\Utils;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentHeirachyResource extends JsonResource
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
            'username' => Utils::resolveProperty($this->username, 'VIEW_PROPERTY_USERNAME', Utils::isMyResource($this->id)),
            'nickname' => Utils::resolveProperty($this->nickname, 'VIEW_PROPERTY_NICKNAME', Utils::isMyResource($this->id)),
            'name' => Utils::resolveProperty($this->name, 'VIEW_PROPERTY_NAME', Utils::isMyResource($this->id)),
            'losing_point_ratio' => $this->losing_point_ratio,
            'rolling_ratio' => $this->rolling_ratio,
            'level' => Utils::resolveProperty($this->level?->label(), 'VIEW_PROPERTY_LEVEL', Utils::isMyResource($this->id)),
            'level_enum' => Utils::resolveProperty($this->level?->name, 'VIEW_PROPERTY_LEVEL', Utils::isMyResource($this->id)),
            'grand_children' => $this->whenLoaded('grand_children'),
        ];
    }
}
