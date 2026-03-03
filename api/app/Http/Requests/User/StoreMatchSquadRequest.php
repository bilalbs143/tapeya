<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreMatchSquadRequest extends FormRequest
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
            'player_ids' => ['required', 'array', 'min:1'],
            'player_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}
