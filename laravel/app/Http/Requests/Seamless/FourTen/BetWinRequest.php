<?php

namespace App\Http\Requests\Seamless\FourTen;

class BetWinRequest extends BaseFourTenRequest
{
    public function rules(): array
    {
        return [
            ...$this->commonRules(),
            'transaction_id' => ['required', 'string'],
            'vendorCode' => ['required', 'string'],
            'gameCode' => ['required', 'string'],
            'game_id' => ['nullable', 'string'],
            'bet' => ['required', 'numeric'],
            'win' => ['required', 'numeric'],
            'overWin' => ['nullable', 'numeric'],
            'betting_data' => ['nullable', 'string'], // JSON string
        ];
    }

    public function getBetAmount()
    {
        return $this->input('bet', 0);
    }

    public function getWinAmount()
    {
        return $this->input('win', 0) + $this->input('overWin', 0);
    }
}
