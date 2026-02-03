<?php

namespace App\Http\Requests\Seamless\FourTen;

class ResultRequest extends BaseFourTenRequest
{
    public function rules(): array
    {
        return [
            ...$this->commonRules(),
            'transaction_type' => ['required', 'string', 'in:WIN,CANCEL,PROMO_WIN,ADJUST,CANCEL_WIN'],
            'transaction_id' => ['required', 'string'],
            'amount' => ['required', 'numeric'],
            'vendorCode' => ['required', 'string'],
            'gameCode' => ['required', 'string'],
            'game_id' => ['nullable', 'string'],
            'overWin' => ['nullable', 'numeric'],
            'reference' => ['nullable', 'string'],
            'reference_for_cancel' => ['nullable', 'string'],
            'betting_data' => ['nullable', 'string'], // JSON string
        ];
    }
}
