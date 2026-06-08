<?php

namespace App\Http\Requests\User;

use App\Enums\Event\DeclareResultTypeEnum;
use App\Models\TournamentMatch;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DeclareResultRequest extends FormRequest
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
            'declare_result_type' => ['required', 'string', Rule::in(DeclareResultTypeEnum::values())],
            'winner_team_id' => [
                'nullable',
                'integer',
                'exists:teams,id',
                Rule::requiredIf(fn () => $this->input('declare_result_type') === DeclareResultTypeEnum::AWARD->value),
            ],
            'declare_result_note' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Scope winner_team_id to only the two teams in this match.
     * The base `exists:teams,id` rule allows any team in the system — this
     * cross-field check prevents a caller from declaring a team that is not
     * part of this fixture.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            /** @var TournamentMatch|null $match */
            $match = $this->route('match');

            if (! $match || ! $this->filled('winner_team_id')) {
                return;
            }

            $allowedTeamIds = [(int) $match->home_team_id, (int) $match->away_team_id];
            if (! in_array((int) $this->input('winner_team_id'), $allowedTeamIds, true)) {
                $validator->errors()->add(
                    'winner_team_id',
                    'The winner must be one of the teams in this match.',
                );
            }
        });
    }
}
