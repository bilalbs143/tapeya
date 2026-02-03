<?php

namespace App\Http\Requests\v1\Admin\Transaction;

use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;

class PayRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('PAY');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'money' => ['sometimes', 'nullable', 'numeric', 'not_in:0'],
            'money_memo' => ['required_with:money'],
            'points' => ['sometimes', 'nullable', 'numeric', 'not_in:0'],
            'points_memo' => ['required_with:points'],
            'coupon_points' => ['sometimes', 'nullable', 'numeric', 'not_in:0'],
            'coupon_points_memo' => ['required_with:coupon_points'],
        ];
    }
}
