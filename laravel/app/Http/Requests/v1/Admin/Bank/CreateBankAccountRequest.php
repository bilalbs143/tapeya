<?php

namespace App\Http\Requests\v1\Admin\Bank;

use App\Enums\Bank\BankAccountTypeEnum;
use App\Models\BankAccount;
use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateBankAccountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('CREATE_BANK_ACCOUNT');
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
                'required',
                'exists:banks,id',
                Rule::unique(BankAccount::class)->where('bank_id', $this->bank_id)->where('account_number', $this->account_number),
            ],
            'type' => ['required', Rule::enum(BankAccountTypeEnum::class)],
            'logo_path' => ['required', 'file', 'mimes:png,jpg,jpeg,webp'],
            'account_holder_name' => 'required|string',
            'account_number' => [
                'required',
                'string',
                Rule::unique(BankAccount::class)->where('bank_id', $this->bank_id)->where('account_number', $this->account_number),
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
