<?php

namespace App\Http\Requests\Admin\Player;

use App\Enums\User\BattingStyleEnum;
use App\Enums\User\BowlingStyleEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Update profile fields for a user in the player registry (roles unchanged).
 */
class UpdateBroadcasterPlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $player = $this->route('player');
        $userId = $player instanceof User ? $player->getKey() : (int) $player;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'nickname' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                'regex:/^[a-zA-Z0-9_]+$/',
                Rule::unique('users', 'nickname')->ignore($userId),
            ],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone' => [
                'sometimes',
                'required',
                'string',
                'regex:/^\+[1-9]\d{6,}$/',
                Rule::unique('users', 'phone')->ignore($userId),
            ],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'playing_role' => ['nullable', Rule::enum(PlayingRoleEnum::class)],
            'bowling_style' => ['nullable', Rule::enum(BowlingStyleEnum::class)],
            'batting_style' => ['nullable', Rule::enum(BattingStyleEnum::class)],
            'country' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
        ];
    }
}
