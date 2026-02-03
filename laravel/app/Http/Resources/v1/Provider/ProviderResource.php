<?php

namespace App\Http\Resources\v1\Provider;

use App\Enums\Common\StatusEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProviderResource extends JsonResource
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
            'company_name' => $this->company?->key?->label(),
            'name' => $this->name,
            'status' => ! $this->disabled_at ? StatusEnum::ACTIVE->label() : StatusEnum::INACTIVE->label(),
            'status_enum' => ! $this->disabled_at ? StatusEnum::ACTIVE->name : StatusEnum::INACTIVE->name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
