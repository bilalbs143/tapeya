<?php

namespace App\Http\Resources\v1\User\Bank;

use App\Utils\Services\Utils;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserBankResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'bank_id' => Utils::resolveProperty($this->bank?->id, 'VIEW_PROPERTY_BANK_NAME', fullMask: true),
            'bank_name' => Utils::resolveProperty($this->bank?->name, 'VIEW_PROPERTY_BANK_NAME', fullMask: true),
            'account_number' => Utils::resolveProperty($this->account_number, 'VIEW_PROPERTY_ACCOUNT_NUMBER'),
            'account_holder' => Utils::resolveProperty($this->account_holder, 'VIEW_PROPERTY_ACCOUNT_HOLDER'),
        ];
    }
}
