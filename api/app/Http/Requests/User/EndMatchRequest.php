<?php

namespace App\Http\Requests\User;

use App\Enums\Event\MatchEndReasonEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EndMatchRequest extends FormRequest
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
            'cancel_reason' => ['required', 'string', Rule::in(MatchEndReasonEnum::values())],
            'cancel_comments' => ['nullable', 'string', 'max:2000'],
            'cancel_points_awarded_each' => ['sometimes', 'boolean'],
        ];
    }
}
