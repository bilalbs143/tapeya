<?php

namespace App\Http\Requests\v1\Admin\Faq;

use App\Enums\Faq\FaqCategoryEnum;
use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateFaqRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('CREATE_FAQ');
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
                'required',
                'string',
                Rule::unique('faqs')->where('category', $this->category)->withoutTrashed(),
            ],
            'content' => 'required',
            'is_active' => 'sometimes|boolean',
            'category' => ['required', Rule::enum(FaqCategoryEnum::class)],
        ];
    }
}
