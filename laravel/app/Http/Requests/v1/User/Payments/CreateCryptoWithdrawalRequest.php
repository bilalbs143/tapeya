<?php

namespace App\Http\Requests\v1\User\Payments;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class CreateCryptoWithdrawalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => 'required|string|in:crypto_withdraw',
            'requested_money' => 'required|numeric',
            // 'requested_money' => 'required|numeric|min:200000',
            'currency' => 'required|string',
            'withdrawal_address' => 'required|string',
        ];
    }
}
