<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTournamentMatchRequest extends FormRequest
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
            'home_team_id' => ['sometimes', 'required', 'integer', 'exists:teams,id'],
            'away_team_id' => ['sometimes', 'required', 'integer', 'different:home_team_id', 'exists:teams,id'],
            'match_date' => ['sometimes', 'required', 'date'],
            'match_time' => ['sometimes', 'required', 'date_format:H:i'],
            'venue_name' => ['sometimes', 'required', 'string', 'max:255'],
            'players_per_side' => ['sometimes', 'required', 'integer', 'min:2', 'max:20'],
            'overs' => ['sometimes', 'required', 'integer', 'min:5', 'max:50'],
            'group_index' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:16'],
        ];
    }
}
