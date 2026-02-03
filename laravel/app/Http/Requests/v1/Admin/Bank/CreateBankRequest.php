<?php

namespace App\Http\Requests\v1\Admin\Bank;

use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;

class CreateBankRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('CREATE_BANK');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'names' => 'required|array',
            'names.*' => 'required|string',
            'code' => 'required|string|unique:banks,code',
            'is_active' => 'sometimes|boolean',
        ];
    }
}
