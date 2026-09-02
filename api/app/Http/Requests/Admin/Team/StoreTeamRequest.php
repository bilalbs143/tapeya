<?php

namespace App\Http\Requests\Admin\Team;

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
            'sponsor' => ['nullable', 'string', 'max:500'],
            'icon_players' => ['nullable', 'string', 'max:500'],
            'owner_user_id' => ['required', 'integer', 'exists:users,id'],
        ];
    }
}
