<?php

namespace App\Http\Resources\v1\Auth;

use App\Http\Resources\v1\User\Bank\UserBankResource;
use App\Utils\Services\Utils;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoginHistoryUserResource extends JsonResource
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
            'status' => $this->status?->label(),
            'status_enum' => $this->status?->name,
            'type' => $this->type?->label(),
            'type_enum' => $this->type?->name,
            'bank_account' => $this->when($this->bank_account, new UserBankResource($this->bank_account)),
        ];
    }
}
