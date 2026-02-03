<?php

namespace App\Http\Requests\v1\Admin\Faq;

use App\Enums\Faq\FaqCategoryEnum;
use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFaqRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('UPDATE_FAQ');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => [
                'sometimes',
                'string',
                Rule::unique('faqs')->where('category', $this->category)->ignore($this->faq)->withoutTrashed(),
            ],
            'content' => 'sometimes',
            'is_active' => 'sometimes|boolean',
            'category' => ['sometimes', Rule::enum(FaqCategoryEnum::class)],
        ];
    }
}
