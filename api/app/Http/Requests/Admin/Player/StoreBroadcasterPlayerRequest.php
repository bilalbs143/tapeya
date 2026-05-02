<?php

namespace App\Http\Requests\Admin\Player;

use App\Enums\User\AppRoleEnum;
use App\Enums\User\BattingStyleEnum;
use App\Enums\User\BowlingStyleEnum;
use App\Enums\User\PlayingRoleEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Create an app user with only the {@see AppRoleEnum::PLAYER} app role (backoffice player registry).
 */
class StoreBroadcasterPlayerRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:255'],
            'nickname' => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z0-9_]+$/', 'unique:users,nickname'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'regex:/^\+[1-9]\d{6,}$/', 'unique:users,phone'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'playing_role' => ['nullable', Rule::enum(PlayingRoleEnum::class)],
            'bowling_style' => ['nullable', Rule::enum(BowlingStyleEnum::class)],
            'batting_style' => ['nullable', Rule::enum(BattingStyleEnum::class)],
            'country' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
        ];
    }
}
