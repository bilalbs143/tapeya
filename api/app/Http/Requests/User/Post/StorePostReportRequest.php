<?php

namespace App\Http\Requests\User\Post;

use App\Enums\Post\PostReportReasonEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePostReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', Rule::in(PostReportReasonEnum::values())],
            'details' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
