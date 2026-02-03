<?php

namespace App\Http\Requests\Seamless\FourTen;

class BettingDetailRequest extends BaseFourTenRequest
{
    public function rules(): array
    {
        return [
            ...$this->commonRules(),
            'transaction_id' => ['required', 'string'],
            'vendorCode' => ['required', 'string'],
            'gameCode' => ['required', 'string'],
            'game_id' => ['nullable', 'string'],
            'data' => ['required', 'array'], // JSON data
        ];
    }

    public function getBettingData()
    {
        return $this->input('data');
    }
}
