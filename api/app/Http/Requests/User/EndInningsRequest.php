<?php

namespace App\Http\Requests\User;

use App\Enums\Event\InningsEndReasonEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EndInningsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'end_reason' => ['required', 'string', Rule::in(InningsEndReasonEnum::values())],
            'end_comments' => ['nullable', 'string', 'max:2000'],
            'points_awarded_each' => ['sometimes', 'boolean'],
        ];
    }
}
