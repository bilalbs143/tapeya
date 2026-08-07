<?php

namespace App\Http\Requests\Admin\Shop;

use App\Enums\Shop\PaymentStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderPaymentRequest extends FormRequest
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
                PaymentStatusEnum::UNPAID->value,
                PaymentStatusEnum::ADVANCE->value,
                PaymentStatusEnum::PAID->value,
            ])],
            'amount_received' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
