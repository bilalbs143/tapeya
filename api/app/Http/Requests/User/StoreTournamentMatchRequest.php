<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreTournamentMatchRequest extends FormRequest
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
            'home_team_id' => ['required', 'integer', 'exists:teams,id'],
            'away_team_id' => ['required', 'integer', 'different:home_team_id', 'exists:teams,id'],
            'match_date' => ['required', 'date'],
            'match_time' => ['required', 'date_format:H:i'],
            'venue_name' => ['required', 'string', 'max:255'],
            'players_per_side' => ['required', 'integer', 'min:2', 'max:20'],
            'overs' => ['required', 'integer', 'min:5', 'max:50'],
            'group_index' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:16'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
        ];
    }
}
