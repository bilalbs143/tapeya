<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeamRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', 'unique:teams,code'],
            'country' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'logo' => ['nullable', 'image', 'max:2048'],

            // Owner/sponsor user id; if omitted, defaults to authenticated user.
            'sponsor_user_id' => ['nullable', 'integer', 'exists:users,id'],

            // Icon players (user ids) for this team.
            'icon_player_ids' => ['nullable', 'array'],
            'icon_player_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}
