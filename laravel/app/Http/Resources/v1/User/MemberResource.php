<?php

namespace App\Http\Resources\v1\User;

use App\Http\Resources\v1\Auth\LoginHistoryResource;
use App\Http\Resources\v1\User\Bank\UserBankResource;
use App\Http\Resources\v1\User\Wallet\UserWalletResource;
use App\Utils\Services\Utils;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if (! $this->wallet) {
            $this->load('wallet');
        }
        if (! $this->referredBy) {
            $this->load('referredBy');
        }

        return [
            'id' => $this->id,
            'parent' => $this->whenLoaded('parent', new ParentResource($this->parent)),
            'parent_user' => $this->whenLoaded('referredBy', new ParentResource($this->referredBy)),
            'type' => $this->type?->label(),
            'type_enum' => $this->type?->name,
            'referral_info' => new ReferralResource($this->resource),
            'name' => Utils::resolveProperty($this->name, 'VIEW_PROPERTY_NAME', Utils::isMyResource($this->id)),
            'username' => Utils::resolveProperty($this->username, 'VIEW_PROPERTY_USERNAME', Utils::isMyResource($this->id)),
            'nickname' => Utils::resolveProperty($this->nickname, 'VIEW_PROPERTY_NICKNAME', Utils::isMyResource($this->id)),
            'dob' => Utils::resolveProperty($this->dob, 'VIEW_PROPERTY_DOB', Utils::isMyResource($this->id)),
            'phone' => Utils::resolveProperty($this->phone, 'VIEW_PROPERTY_PHONE', Utils::isMyResource($this->id)),
            'level' => Utils::resolveProperty($this->level?->label(), 'VIEW_PROPERTY_LEVEL', Utils::isMyResource($this->id)),
            'level_enum' => Utils::resolveProperty($this->level?->name, 'VIEW_PROPERTY_LEVEL', Utils::isMyResource($this->id)),
            'locale' => $this->locale,
            'memo' => $this->memo,
            'status' => $this->status?->label(),
            'status_enum' => $this->status?->name,
            'is_new_signup_first_recharge_bonus_enabled' => $this->is_new_signup_first_recharge_bonus_enabled,
            'is_first_recharge_bonus_of_day_enabled' => $this->is_first_recharge_bonus_of_day_enabled,
            'is_bonus_per_recharge_enabled' => $this->is_bonus_per_recharge_enabled,
            'is_weekly_loss_bonus_enabled' => $this->is_weekly_loss_bonus_enabled,
            'referral_bonus_percentage' => $this->referral_bonus_percentage,
            'referral_bonus_percentage_memo' => $this->referral_bonus_percentage_memo,
            'created_at_ip' => $this->created_at_ip,
            'bank_account' => $this->when($this->bank_account, new UserBankResource($this->bank_account)),
            'wallet' => $this->when($this->wallet, new UserWalletResource($this->wallet)),
            'last_login' => new LoginHistoryResource($this->last_login()),
            'blocked_at' => $this->blocked_at,
            'approved_at' => $this->approved_at,
            'rejected_at' => $this->rejected_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
