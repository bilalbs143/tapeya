<?php

namespace App\Http\Resources\v1\User\Domain;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentDomainResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->data,
            'type' => $this->type?->label(),
            'type_enum' => $this->type?->name,
        ];
    }
}
