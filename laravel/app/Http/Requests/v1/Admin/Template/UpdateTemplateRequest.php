<?php

namespace App\Http\Requests\v1\Admin\Template;

use App\Enums\Template\TemplateTypeEnum;
use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTemplateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('UPDATE_TEMPLATE');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|string',
            'content' => 'sometimes',
            'is_active' => 'sometimes|boolean',
            'type' => ['sometimes', Rule::enum(TemplateTypeEnum::class)],
        ];
    }
}
