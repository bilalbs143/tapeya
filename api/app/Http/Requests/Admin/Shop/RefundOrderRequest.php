<?php

namespace App\Http\Requests\Admin\Shop;

use App\Enums\Shop\PaymentStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RefundOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'payment_status' => ['required', Rule::in([
                PaymentStatusEnum::REFUNDED->value,
            ])],
            'amount_received' => ['nullable', 'numeric', 'in:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'amount_received' => 0,
        ]);
    }
}
