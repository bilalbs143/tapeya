<?php

namespace App\Http\Requests\Seamless\TheBigHit;

use App\Models\UserGameSession;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ResultRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'requestid' => 'required|string',
            'token' => ['required', 'string', Rule::exists(UserGameSession::class, 'token')],
            'signature' => 'required|string',
            'game_id' => 'required|string',
            'bet' => 'required|numeric',
            'buybet' => 'required|numeric',
            'payout' => 'required|numeric',
            // 'currency' => 'required|string',
            'roundid' => 'required|string',
            // 'details' => 'required|array',
            // 'details.free' => 'required|numeric',
            // 'details.deck' => 'required|array',
            // 'details.bonus' => 'required|numeric',
        ];
    }

    public function getTransactionId()
    {
        return $this->input('requestid');
    }

    public function getRequestId()
    {
        return $this->input('requestid');
    }

    public function getBetAmount()
    {
        return $this->input('bet');
    }

    public function getBuyBetAmount()
    {
        return $this->input('buybet');
    }

    public function getTotalBetAmount()
    {
        return $this->getBetAmount() + $this->getBuyBetAmount();
    }

    public function getRoundId()
    {
        return $this->input('roundid');
    }

    public function getPayoutAmount()
    {
        return $this->input('payout');
    }

    public function getGameId()
    {
        return $this->input('game_id');
    }
}
