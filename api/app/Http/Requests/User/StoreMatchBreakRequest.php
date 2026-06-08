<?php

namespace App\Http\Requests\User;

use App\Enums\Event\MatchBreakTypeEnum;
use App\Models\TournamentMatch;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMatchBreakRequest extends FormRequest
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
            'break_type' => ['required', 'string', Rule::in(MatchBreakTypeEnum::values())],
            'notes' => ['nullable', 'string', 'max:2000'],
            'innings_id' => ['nullable', 'integer', 'exists:innings,id'],
        ];
    }

    /**
     * Scope innings_id to only innings that belong to this match.
     * The base `exists:innings,id` rule allows any innings row in the system.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            /** @var TournamentMatch|null $match */
            $match = $this->route('match');

            if (! $match || ! $this->filled('innings_id')) {
                return;
            }

            $belongs = $match->innings()->where('id', (int) $this->input('innings_id'))->exists();
            if (! $belongs) {
                $validator->errors()->add(
                    'innings_id',
                    'The innings does not belong to this match.',
                );
            }
        });
    }
}
