<?php

namespace App\Http\Resources\v1\Transaction;

use App\Http\Resources\v1\User\Bank\UserBankResource;
use App\Utils\Services\Utils;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionExchangeRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $bank = $this->bank;
        if ($bank) {
            if (isset($bank['bank_id'])) {
                $bank['bank_id'] = Utils::resolveProperty($bank['bank_id'], 'VIEW_PROPERTY_BANK_NAME', fullMask: true);
            }
            if (isset($bank['bank_code'])) {
                $bank['bank_code'] = Utils::resolveProperty($bank['bank_code'], 'VIEW_PROPERTY_BANK_NAME', fullMask: true);
            }
            if (isset($bank['bank_name'])) {
                $bank['bank_name'] = Utils::resolveProperty($bank['bank_name'], 'VIEW_PROPERTY_BANK_NAME', fullMask: true);
            }
            if (isset($bank['account_holder'])) {
                $bank['account_holder'] = Utils::resolveProperty($bank['account_holder'], 'VIEW_PROPERTY_ACCOUNT_HOLDER');
            }
            if (isset($bank['account_number'])) {
                $bank['account_number'] = Utils::resolveProperty($bank['account_number'], 'VIEW_PROPERTY_ACCOUNT_NUMBER');
            }
        }

        return [
            'id' => $this->id,
            'type' => $this->type?->label(),
            'type_enum' => $this->type?->name,
            'ip_address' => $this->ip_address,
            'requested_money' => $this->requested_money,
            'approved_money' => $this->approved_money,
            'before_money' => $this->before_money,
            'after_money' => $this->after_money,
            'default_bank' => new UserBankResource($this->default_bank),
            'requested_bank' => $bank,
            'status' => $this->status?->label(),
            'status_enum' => $this->status?->name,
        ];
    }
}
