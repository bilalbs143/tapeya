<?php

namespace App\Http\Resources\v1\Activity;

use App\Utils\Services\Utils;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
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
            'description' => $this->description,
            'username' => Utils::resolveProperty($this->causer?->username, 'VIEW_PROPERTY_USERNAME', Utils::isMyResource($this->causer?->id)),
            'created_at' => $this->created_at,
        ];
    }
}
