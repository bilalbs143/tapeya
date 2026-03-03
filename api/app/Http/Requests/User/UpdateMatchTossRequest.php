<?php

namespace App\Http\Requests\User;

use App\Enums\Event\TossChoiceEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMatchTossRequest extends FormRequest
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
            'winning_team_id' => ['required', 'integer', 'exists:teams,id'],
            'chose_to_bat_or_bowl' => ['required', 'string', Rule::in(TossChoiceEnum::values())],
        ];
    }
}
