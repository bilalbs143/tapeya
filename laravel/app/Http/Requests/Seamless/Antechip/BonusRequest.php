<?php

namespace App\Http\Requests\Seamless\Antechip;

class BonusRequest extends BaseAntechipRequest
{
    public function rules(): array
    {
        return [
            ...$this->getUserRules(),
            'data' => ['required'],
            'data.transaction_id' => ['string', 'required'],
            'data.amount' => ['numeric', 'required'],
            'data.timestamp' => ['integer', 'required'],
            'data.game_id' => ['string', 'sometimes', 'nullable'],
            ...$this->getHashRules(),
        ];
    }
}
