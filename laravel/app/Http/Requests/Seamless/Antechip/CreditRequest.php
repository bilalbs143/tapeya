<?php

namespace App\Http\Requests\Seamless\Antechip;

class CreditRequest extends BaseAntechipRequest
{
    public function rules(): array
    {
        return [
            ...$this->getUserRules(),
            ...$this->getTransactionRules(),
            ...$this->getReferenceDebitTransactionRules(),
            ...$this->getHashRules(),
        ];
    }
}
