<?php

namespace App\Http\Requests\Seamless\FourTen;

use Illuminate\Foundation\Http\FormRequest;

abstract class BaseFourTenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function getGameId()
    {
        return $this->input('gameCode');
    }

    public function getRoundId()
    {
        return $this->input('game_id');
    }

    public function getTransactionId()
    {
        return $this->input('transaction_id');
    }

    public function getAmount(): float
    {
        return (float) ($this->input('amount') ?? $this->input('bet', 0));
    }

    public function getOverWinAmount()
    {
        return $this->input('overWin');
    }

    public function getWinningAmount()
    {
        return $this->getAmount() + $this->getOverWinAmount();
    }

    public function getReference()
    {
        return $this->input('reference');
    }

    public function getTransactionType()
    {
        return $this->input('transaction_type');
    }

    protected function commonRules()
    {
        return [
            'user_id' => ['required', 'string'],
        ];
    }

    protected function getGameRules()
    {
        return [
            'vendorCode' => ['required', 'string'],
            'gameCode' => ['required', 'string'],
            'game_id' => ['nullable', 'string'], // Optional round ID
        ];
    }

    protected function getTransactionRules()
    {
        return [
            'transaction_id' => ['required', 'string'],
            'amount' => ['required', 'numeric'],
            'vendorCode' => ['required', 'string'],
            'gameCode' => ['required', 'string'],
            'game_id' => ['nullable', 'string'], // optional round ID
        ];
    }
}
