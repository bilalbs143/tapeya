<?php

namespace App\Http\Requests\v1\Admin\Bank;

use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBankRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('UPDATE_BANK');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'names' => 'sometimes|array',
            'names.*' => 'sometimes|string',
            'code' => [
                'sometimes',
                'string',
                Rule::unique('banks')->ignore($this->bank)->withoutTrashed(),
            ],
            'is_active' => 'sometimes|boolean',
        ];
    }
}
