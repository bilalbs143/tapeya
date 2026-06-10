<?php

namespace App\Http\Requests\User;

use App\Models\TournamentMatch;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMatchSubstituteRequest extends FormRequest
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
            'innings_id' => ['required', 'integer', 'exists:innings,id'],
            'replaced_player_id' => ['required', 'integer', 'exists:users,id'],
            'substitute_player_id' => [
                'required',
                'integer',
                'exists:users,id',
                Rule::notIn([(int) $this->input('replaced_player_id')]),
            ],
            'fielder_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }

    /**
     * Scope innings_id to only innings belonging to this match.
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
