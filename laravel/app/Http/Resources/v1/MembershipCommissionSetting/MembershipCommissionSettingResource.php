<?php

namespace App\Http\Resources\v1\MembershipCommissionSetting;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembershipCommissionSettingResource extends JsonResource
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
            'level' => $this->level?->namedLabel(),
            'level_enum' => $this->level?->name,
            'new_signup_first_recharge_bonus' => $this->new_signup_first_recharge_bonus,
            'new_signup_first_recharge_bonus_maximum_amount' => $this->new_signup_first_recharge_bonus_maximum_amount,
            'first_recharge_bonus_of_day' => $this->first_recharge_bonus_of_day,
            'first_recharge_bonus_of_day_maximum_amount' => $this->first_recharge_bonus_of_day_maximum_amount,
            'bonus_per_recharge' => $this->bonus_per_recharge,
            'bonus_per_recharge_maximum_amount' => $this->bonus_per_recharge_maximum_amount,
        ];
    }
}
