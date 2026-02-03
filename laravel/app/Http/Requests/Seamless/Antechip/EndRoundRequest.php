<?php

namespace App\Http\Requests\Seamless\Antechip;

class EndRoundRequest extends BaseAntechipRequest
{
    public function rules(): array
    {
        return [
            ...$this->getUserRules(),
            'data' => ['required'],
            'data.transaction_id' => ['string', 'required'],
            'data.timestamp' => ['integer', 'required'],
            'data.game_id' => ['string', 'required'],
            'data.round_id' => ['string', 'required'],
            ...$this->getReferenceDebitTransactionRules(),
            ...$this->getHashRules(),
        ];
    }
}
