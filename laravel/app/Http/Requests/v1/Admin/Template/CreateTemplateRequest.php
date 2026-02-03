<?php

namespace App\Http\Requests\v1\Admin\Template;

use App\Enums\Template\TemplateTypeEnum;
use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateTemplateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('CREATE_TEMPLATE');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string',
            'content' => 'required',
            'is_active' => 'sometimes|boolean',
            'type' => ['required', Rule::enum(TemplateTypeEnum::class)],
        ];
    }
}
