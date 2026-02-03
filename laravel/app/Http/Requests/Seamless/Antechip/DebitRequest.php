<?php

namespace App\Http\Requests\Seamless\Antechip;

class DebitRequest extends BaseAntechipRequest
{
    public function rules(): array
    {
        return [
            ...$this->getUserRules(),
            ...$this->getTransactionRules(),
            ...$this->getHashRules(),
        ];
    }
}
