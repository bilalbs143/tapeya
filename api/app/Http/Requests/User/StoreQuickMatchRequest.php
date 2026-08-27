<?php

namespace App\Http\Requests\User;

use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\TossChoiceEnum;
use App\Utils\Services\OtpService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreQuickMatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        foreach (['home', 'away'] as $side) {
            $players = $this->input("{$side}.players", []);
            if (! is_array($players)) {
                continue;
            }
            foreach ($players as $i => $player) {
                if (! is_array($player)) {
                    continue;
                }
                if (! empty($player['name'])) {
                    $players[$i]['name'] = trim((string) $player['name']);
                }
                if (! empty($player['phone'])) {
                    $players[$i]['phone'] = OtpService::normalizePhone((string) $player['phone']);
                }
            }
            $this->merge([
                $side => array_merge((array) $this->input($side, []), ['players' => $players]),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'cricket_format' => ['required', 'string', Rule::in(CricketFormatEnum::values())],
            'overs' => ['required', 'integer', 'min:1', 'max:255'],
            'players_per_side' => ['required', 'integer', 'min:2', 'max:20'],
            'home' => ['required', 'array'],
            'home.name' => ['required_without:home.team_id', 'nullable', 'string', 'max:255'],
            'home.team_id' => ['nullable', 'integer', 'exists:teams,id'],
            'home.players' => ['required', 'array', 'min:1', 'max:20'],
            'home.players.*.user_id' => ['nullable', 'integer', 'exists:users,id'],
            'home.players.*.name' => ['nullable', 'string', 'max:255', 'regex:/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/'],
            'home.players.*.phone' => ['nullable', 'string', 'regex:/^\+[1-9]\d{6,14}$/'],
            'away' => ['required', 'array'],
            'away.name' => ['required_without:away.team_id', 'nullable', 'string', 'max:255'],
            'away.team_id' => ['nullable', 'integer', 'exists:teams,id', 'different:home.team_id'],
            'away.players' => ['required', 'array', 'min:1', 'max:20'],
            'away.players.*.user_id' => ['nullable', 'integer', 'exists:users,id'],
            'away.players.*.name' => ['nullable', 'string', 'max:255', 'regex:/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/'],
            'away.players.*.phone' => ['nullable', 'string', 'regex:/^\+[1-9]\d{6,14}$/'],
            'toss' => ['nullable', 'array'],
            'toss.winning_side' => ['required_with:toss', 'string', Rule::in(['home', 'away'])],
            'toss.chose_to_bat_or_bowl' => ['required_with:toss', 'string', Rule::in(TossChoiceEnum::values())],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $pps = (int) $this->input('players_per_side');
            foreach (['home', 'away'] as $side) {
                $players = $this->input("{$side}.players", []);
                if (! is_array($players)) {
                    continue;
                }
                if ($pps >= 2 && count($players) > $pps) {
                    $validator->errors()->add(
                        "{$side}.players",
                        "At most {$pps} players per side.",
                    );
                }
                foreach ($players as $i => $player) {
                    if (! is_array($player)) {
                        continue;
                    }
                    $hasUser = ! empty($player['user_id']);
                    $hasName = ! empty($player['name']);
                    $hasPhone = ! empty($player['phone']);
                    if ($hasUser && ($hasName || $hasPhone)) {
                        $validator->errors()->add(
                            "{$side}.players.{$i}.user_id",
                            'Provide either user_id or name+phone, not both.',
                        );
                    }
                    if (! $hasUser && (! $hasName || ! $hasPhone)) {
                        $validator->errors()->add(
                            "{$side}.players.{$i}.name",
                            'New players require name and phone.',
                        );
                    }
                }
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'home.players.*.name.regex' => 'Name may only contain letters and spaces.',
            'away.players.*.name.regex' => 'Name may only contain letters and spaces.',
            'home.players.*.phone.regex' => 'Phone must include country code (e.g. +923001234567).',
            'away.players.*.phone.regex' => 'Phone must include country code (e.g. +923001234567).',
        ];
    }
}
