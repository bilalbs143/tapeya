<?php

namespace App\Http\Requests\Admin;

use App\Enums\Support\SupportMessageStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSupportMessageRequest extends FormRequest
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
            'status' => ['required', Rule::enum(SupportMessageStatusEnum::class)],
        ];
    }
}
