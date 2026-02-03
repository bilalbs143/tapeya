<?php

namespace App\Http\Resources\v1\Auth;

use App\Http\Resources\v1\User\Bank\UserBankResource;
use App\Http\Resources\v1\User\ReferralResource;
use App\Http\Resources\v1\User\Wallet\UserWalletResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoginResource extends JsonResource
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
            'type' => $this->type?->label(),
            'type_enum' => $this->type?->name,
            'name' => $this->name,
            'username' => $this->username,
            'nickname' => $this->nickname,
            'locale' => $this->locale,
            'dob' => $this->dob,
            'phone' => $this->phone,
            'level' => $this->level?->label(),
            'level_enum' => $this->level?->name,
            'is_admin' => $this->when($this->canAccessBackOffice(), $this->is_admin),
            'can_access_back_office' => $this->canAccessBackOffice(),
            // 'role' => $this->role(),
            'status' => $this->status?->label(),
            'status_enum' => $this->status?->name,
            'created_at_ip' => $this->created_at_ip,
            'wallet' => $this->when($this->wallet, new UserWalletResource($this->wallet)),
            'permissions' => $this->when($this->canAccessBackOffice(), $this->getPermissions()),
            'bank_account' => $this->when($this->bank_account, new UserBankResource($this->bank_account)),
            'referral_info' => new ReferralResource($this->resource),
        ];
    }
}
