<?php

namespace App\Http\Requests\Seamless\Antechip;

class JackpotRequest extends BaseAntechipRequest
{
    public function rules(): array
    {
        return [
            ...$this->getUserRules(),
            ...$this->getTransactionRules(),
            ...$this->getReferenceDebitTransactionRules(),
            ...$this->getHashRules(),
            'data.jackpot_id' => ['string', 'required'],
        ];
    }
}
