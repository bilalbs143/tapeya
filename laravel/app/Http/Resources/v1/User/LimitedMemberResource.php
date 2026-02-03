<?php

namespace App\Http\Resources\v1\User;

use App\Http\Resources\v1\User\Bank\UserBankResource;
use App\Utils\Services\Utils;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LimitedMemberResource extends JsonResource
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
            'name' => Utils::resolveProperty($this->name, 'VIEW_PROPERTY_NAME', Utils::isMyResource($this->id)),
            'username' => Utils::resolveProperty($this->username, 'VIEW_PROPERTY_USERNAME', Utils::isMyResource($this->id)),
            'nickname' => Utils::resolveProperty($this->nickname, 'VIEW_PROPERTY_NICKNAME', Utils::isMyResource($this->id)),
            'status' => $this->status?->label(),
            'status_enum' => $this->status?->name,
            'type' => $this->type?->label(),
            'type_enum' => $this->type?->name,
            'phone' => Utils::resolveProperty($this->phone, 'VIEW_PROPERTY_PHONE', Utils::isMyResource($this->id)),
            'parent' => $this->whenLoaded('parent', new ParentResource($this->parent)),
            'parent_user' => $this->whenLoaded('referredBy', new ParentResource($this->referredBy)),
            'bank_account' => $this->when($this->bank_account, new UserBankResource($this->bank_account)),
            'referral_info' => new ReferralResource($this->resource),
            'created_at' => $this->created_at,
        ];
    }
}
