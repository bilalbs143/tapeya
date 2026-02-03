<?php

namespace App\Http\Resources\v1\Promotion;

use App\Enums\Promotion\PromotionProgressStateEnum;
use App\Enums\Promotion\PromotionTypeEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PromotionProgressResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'promotion_id' => $this->promotion_id,
            'promotion' => $this->whenLoaded('promotion', fn () => [
                'id' => $this->promotion?->id,
                'name' => $this->promotion?->name,
                'type' => $this->promotion?->type,
                'type_enum' => $this->promotion?->type ? PromotionTypeEnum::from($this->promotion->type)->name : null,
            ]),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'username' => $this->user?->username,
                'name' => $this->user?->name,
                'type_enum' => $this->user?->type?->name,
            ]),
            'state' => $this->state,
            'state_enum' => $this->state ? PromotionProgressStateEnum::from($this->state)->name : null,
            'turnover' => $this->turnover,
            'net_win_loss' => $this->net_win_loss,
            'meta' => $this->meta,
            'activated_at' => $this->activated_at,
            'completed_at' => $this->completed_at,
        ];
    }
}
