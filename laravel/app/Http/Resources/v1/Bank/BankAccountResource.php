<?php

namespace App\Http\Resources\v1\Bank;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BankAccountResource extends JsonResource
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
            'bank' => new BankResource($this->bank),
            'type' => $this->type?->label(),
            'type_enum' => $this->type?->name,
            'logo_path' => $this->logo_path,
            'account_holder_name' => $this->account_holder_name,
            'account_number' => $this->account_number,
            'qr_code_path' => $this->qr_code_path,
            'is_active' => $this->is_active,
            'min_deposit_amount' => $this->min_deposit_amount,
            'max_deposit_amount' => $this->max_deposit_amount,
            'bank_transaction_fee' => $this->bank_transaction_fee,
            'bank_transaction_subsidi' => $this->bank_transaction_subsidi,
        ];
    }
}
