<?php

namespace App\Http\Requests\Seamless\Antechip;

class RefundRequest extends BaseAntechipRequest
{
    public function rules(): array
    {
        return [
            ...$this->getUserRules(),
            'data' => ['required'],
            'data.transaction_id' => ['string', 'required'],
            'data.reference_debit_transaction' => ['string', 'required'],
            'data.amount' => ['numeric', 'required'],
            'data.timestamp' => ['integer', 'required'],
            ...$this->getReferenceDebitTransactionRules(),
            ...$this->getHashRules(),
        ];
    }
}
