<?php

namespace App\Http\Requests\User;

use App\Enums\Event\TargetRevisionActionEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReviseTargetRequest extends FormRequest
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
            'revised_target' => ['required', 'integer', 'min:1', 'max:600'],
            'action' => ['required', 'string', Rule::in(TargetRevisionActionEnum::values())],
        ];
    }
}
