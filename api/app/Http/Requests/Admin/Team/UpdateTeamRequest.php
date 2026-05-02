<?php

namespace App\Http\Requests\Admin\Team;

use App\Models\Team;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeamRequest extends FormRequest
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
        /** @var Team $team */
        $team = $this->route('team');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => ['sometimes', 'required', 'string', 'max:20', Rule::unique('teams', 'code')->ignore($team->id)],
            'country' => ['sometimes', 'required', 'string', 'max:100'],
            'city' => ['sometimes', 'required', 'string', 'max:100'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'sponsor_user_id' => ['sometimes', 'required', 'integer', 'exists:users,id'],
            'icon_player_ids' => ['nullable', 'array'],
            'icon_player_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}
