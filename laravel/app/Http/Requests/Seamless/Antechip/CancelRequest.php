<?php

namespace App\Http\Requests\Seamless\Antechip;

class CancelRequest extends BaseAntechipRequest
{
    public function rules(): array
    {
        return [
            ...$this->getUserRules(),
            'data' => ['required'],
            'data.transaction_id' => ['string', 'required'],
            'data.amount' => ['numeric', 'required'],
            'data.timestamp' => ['integer', 'required'],
            ...$this->getReferenceCreditTransactionRules(),
            ...$this->getHashRules(),
        ];
    }
}
