<?php

namespace App\Http\Requests\Seamless\Antechip;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

abstract class BaseAntechipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function getUserRules()
    {
        return [
            'user' => 'required|array',
            'user.username' => 'required|string',
            'user.token' => 'required|string',
        ];
    }

    protected function getHashRules()
    {
        return [
            'hash' => 'required|string',
        ];
    }

    protected function getTransactionRules()
    {
        return [
            'data' => 'required|array',
            'data.transaction_id' => 'required|string',
            'data.amount' => 'required|numeric',
            'data.timestamp' => 'required|numeric',
            'data.game_id' => 'required|string',
            'data.round_id' => 'sometimes|nullable',
        ];
    }

    protected function getReferenceDebitTransactionRules()
    {
        return [
            'data.reference_debit_transaction' => ['string', 'required'],
        ];
    }

    protected function getReferenceCreditTransactionRules()
    {
        return [
            'data.reference_credit_transaction' => ['string', 'required'],
        ];
    }

    public function __call($method, $parameters)
    {
        if (strpos($method, 'get') === 0) {
            $param = Str::snake(substr($method, 3));

            return $this->has("data.{$param}") ? $this->input("data.{$param}") : null;
        }

        if (strpos($method, 'has') === 0) {
            $param = Str::snake(substr($method, 3));

            return $this->has("data.{$param}");
        }
    }
}
