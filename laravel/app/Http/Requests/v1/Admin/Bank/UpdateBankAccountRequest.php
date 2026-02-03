<?php

namespace App\Http\Requests\v1\Admin\Bank;

use App\Enums\Bank\BankAccountTypeEnum;
use App\Models\BankAccount;
use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBankAccountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('UPDATE_BANK_ACCOUNT');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'bank_id' => [
                'sometimes',
                'exists:banks,id',
                Rule::unique(BankAccount::class)->where('bank_id', $this->bank_id ?? $this->bankAccount->bank_id)->where('account_number', $this->account_number ?? $this->bankAccount->account_number)->ignore($this->bankAccount),
            ],
            'type' => ['sometimes', Rule::enum(BankAccountTypeEnum::class)],
            'logo_path' => ['sometimes', 'file', 'mimes:png,jpg,jpeg,webp'],
            'account_holder_name' => 'sometimes|string',
            'account_number' => [
                'sometimes',
                'string',
                Rule::unique(BankAccount::class)->where('bank_id', $this->bank_id ?? $this->bankAccount->bank_id)->where('account_number', $this->account_number ?? $this->bankAccount->account_number)->ignore($this->bankAccount),
            ],
            'qr_code_path' => ['sometimes', 'file', 'mimes:png,jpg,jpeg,webp'],
            'is_active' => 'sometimes|boolean',
            'min_deposit_amount' => 'sometimes|numeric',
            'max_deposit_amount' => 'sometimes|numeric',
            'bank_transaction_fee' => 'sometimes|numeric',
            'bank_transaction_subsidi' => 'sometimes|numeric',
        ];
    }
}
