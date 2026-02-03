<?php

namespace App\Http\Requests\v1\User\ExchangeRequest;

use App\Enums\Transaction\ExchangeRequestViaEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Models\Bank;
use App\Models\BankAccount;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExchangeRequestRequest extends FormRequest
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
        $rules = [
            'type' => ['required', Rule::enum(TransactionTypeEnum::class)],
            'requested_money' => ['required', 'numeric', 'min:1'],
            'via' => ['sometimes', 'nullable', Rule::enum(ExchangeRequestViaEnum::class)],
        ];

        if (empty($this->input('via'))) {
            return $rules;
        }

        if (
            $this->enum('type', TransactionTypeEnum::class) === TransactionTypeEnum::DEPOSIT &&
            $this->enum('via', ExchangeRequestViaEnum::class) === ExchangeRequestViaEnum::BANK_TRANSFER
        ) {
            $rules = array_merge($rules, $this->bankTransferRules());
        }

        return $rules;
    }

    private function bankTransferRules(): array
    {
        return [
            'bank_id' => ['sometimes', Rule::exists(Bank::class, 'id')->withoutTrashed()],
            'bank_account_id' => ['required', Rule::exists(BankAccount::class, 'id')->withoutTrashed()],
            'transaction_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'receipt_path' => ['sometimes', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf'],
        ];
    }
}
