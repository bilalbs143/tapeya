<?php

namespace App\Http\Resources\v1\Promotion;

use App\Enums\Common\StatusEnum;
use App\Enums\Promotion\PromotionTypeEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PromotionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'type_enum' => PromotionTypeEnum::from($this->type)->name,
            'status' => $this->status,
            'status_enum' => $this->status ? StatusEnum::from($this->status)->name : null,
            'valid_from' => $this->valid_from,
            'valid_to' => $this->valid_to,
            'is_stackable' => $this->is_stackable,
            'is_visible' => $this->is_visible,
            'image' => $this->image,
            'game_scope' => $this->game_scope,
            'config' => $this->config,
        ];
    }
}
