<?php

namespace App\Http\Requests\User;

use App\Enums\Tournament\TournamentTypeEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserTournamentRequest extends FormRequest
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
            'tournament_name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'number_of_teams' => ['required', 'integer', 'min:2', 'max:500'],
            'tournament_type' => ['sometimes', Rule::enum(TournamentTypeEnum::class)],
            'venue_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'end_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date'],
            'country' => ['sometimes', 'nullable', 'string', 'max:100'],
            'short_name' => ['required', 'string', 'max:64'],
            'prize' => ['sometimes', 'nullable', 'string', 'max:255'],
            'number_of_groups' => ['sometimes', 'integer', 'min:1', 'max:16'],
        ];
    }
}
