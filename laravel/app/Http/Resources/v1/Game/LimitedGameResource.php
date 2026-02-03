<?php

namespace App\Http\Resources\v1\Game;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LimitedGameResource extends JsonResource
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
            'name' => $this->name,
            'type' => $this->type,
            'image_url' => $this->image_url,
            'company' => $this->company?->key?->label(),
            'provider' => $this->provider?->name,
        ];
    }
}
