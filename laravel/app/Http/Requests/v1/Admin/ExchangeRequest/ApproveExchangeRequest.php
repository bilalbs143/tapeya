<?php

namespace App\Http\Requests\v1\Admin\ExchangeRequest;

use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;

class ApproveExchangeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('APPROVE_EXCHANGE_REQUEST');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'approved_money' => ['required', 'numeric', 'min:1'],
        ];
    }
}
