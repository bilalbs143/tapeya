<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTournamentTeamRequest extends FormRequest
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
        $tournament = $this->route('tournament');
        $maxGroups = $tournament && $tournament->number_of_groups > 0
            ? $tournament->number_of_groups
            : 16;

        return [
            'group_index' => ['required', 'integer', 'min:1', 'max:'.$maxGroups],
        ];
    }
}
