<?php

namespace App\Http\Resources\v1\User;

use App\Enums\User\UserDomainTypeEnum;
use App\Http\Resources\v1\Auth\LoginHistoryResource;
use App\Http\Resources\v1\User\Bank\UserBankResource;
use App\Http\Resources\v1\User\Domain\AgentDomainResource;
use App\Http\Resources\v1\User\Wallet\UserWalletResource;
use App\Utils\Services\Utils;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentResource extends JsonResource
{
    public $preserveKeys = true;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if (! $this->bank_account) {
            $this->load('bank_account');
        }
        if (! $this->domains) {
            $this->load('domains');
        }
        if (! $this->wallet) {
            $this->load('wallet');
        }
        if (! $this->parent) {
            $this->load('parent');
        }

        return [
            'id' => $this->id,
            'parent' => $this->whenLoaded('parent', new ParentResource($this->parent)),
            'type' => $this->type?->label(),
            'type_enum' => $this->type?->name,
            'username' => Utils::resolveProperty($this->username, 'VIEW_PROPERTY_USERNAME', Utils::isMyResource($this->id)),
            'nickname' => Utils::resolveProperty($this->nickname, 'VIEW_PROPERTY_NICKNAME', Utils::isMyResource($this->id)),
            'name' => Utils::resolveProperty($this->name, 'VIEW_PROPERTY_NAME', Utils::isMyResource($this->id)),
            'phone' => Utils::resolveProperty($this->phone, 'VIEW_PROPERTY_PHONE', Utils::isMyResource($this->id)),
            'dob' => Utils::resolveProperty($this->dob, 'VIEW_PROPERTY_DOB', Utils::isMyResource($this->id)),
            'referral_info' => new ReferralResource($this->resource),
            'losing_point_ratio' => $this->losing_point_ratio,
            'rolling_ratio' => $this->rolling_ratio,
            'level' => Utils::resolveProperty($this->level?->label(), 'VIEW_PROPERTY_LEVEL', Utils::isMyResource($this->id)),
            'level_enum' => Utils::resolveProperty($this->level?->name, 'VIEW_PROPERTY_LEVEL', Utils::isMyResource($this->id)),
            'locale' => $this->locale,
            'bank_account' => $this->when($this->bank_account, new UserBankResource($this->bank_account)),
            'memo' => $this->memo,
            'status' => $this->status?->label(),
            'status_enum' => $this->status?->name,
            'is_new_signup_first_recharge_bonus_enabled' => $this->is_new_signup_first_recharge_bonus_enabled,
            'is_first_recharge_bonus_of_day_enabled' => $this->is_first_recharge_bonus_of_day_enabled,
            'is_bonus_per_recharge_enabled' => $this->is_bonus_per_recharge_enabled,
            'blocked_at' => $this->blocked_at,
            'approved_at' => $this->approved_at,
            'rejected_at' => $this->rejected_at,
            'domains' => $this->when($this->domains, AgentDomainResource::collection($this->domains->where('type', UserDomainTypeEnum::DOMAIN))),
            'telegrams' => $this->when($this->domains, AgentDomainResource::collection($this->domains->where('type', UserDomainTypeEnum::TELEGRAM))),
            'kakao_talks' => $this->when($this->domains, AgentDomainResource::collection($this->domains->where('type', UserDomainTypeEnum::KAKAO_TALK))),
            'last_login' => new LoginHistoryResource($this->last_login()),
            'grand_children_count' => $this->grand_children_count(),
            'members_count' => $this->allMembers()->count(),
            'wallet' => $this->when($this->wallet, new UserWalletResource($this->wallet)),
            'permissions' => $this->getPermissions(),
            'created_at_ip' => $this->created_at_ip,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
