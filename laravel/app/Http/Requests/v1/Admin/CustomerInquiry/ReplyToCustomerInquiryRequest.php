<?php

namespace App\Http\Requests\v1\Admin\CustomerInquiry;

use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;

class ReplyToCustomerInquiryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('REPLY_TO_CUSTOMER_INQUIRY');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => 'required|string',
        ];
    }
}
