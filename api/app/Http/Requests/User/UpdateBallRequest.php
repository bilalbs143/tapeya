<?php

namespace App\Http\Requests\User;

use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\ShotPositionEnum;
use App\Models\Ball;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBallRequest extends FormRequest
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
        /** @var Ball|null $ball */
        $ball = $this->route('ball');
        $dismissalType = $this->input('dismissal_type') ?? $ball?->dismissal_type?->value;
        $isFreeHit = $this->filled('is_free_hit') ? $this->boolean('is_free_hit') : ($ball?->is_free_hit ?? false);
        $isWicket = $this->filled('is_wicket') ? $this->boolean('is_wicket') : ($ball?->is_wicket ?? false);
        $fielderRequired = in_array($dismissalType, ['caught', 'run_out', 'stumped'], true);

        $rules = [
            'over' => ['sometimes', 'integer', 'min:0'],
            'ball_in_over' => ['sometimes', 'integer', 'min:1', 'max:7'],
            'striker_id' => ['sometimes', 'integer', 'exists:users,id'],
            'non_striker_id' => ['sometimes', 'integer', 'exists:users,id', 'different:striker_id'],
            'bowler_id' => ['sometimes', 'integer', 'exists:users,id'],
            'runs' => ['sometimes', 'integer', 'min:0', 'max:255'],
            'runs_off_bat' => ['sometimes', 'integer', 'min:0', 'max:255'],
            'is_no_ball' => ['sometimes', 'boolean'],
            'is_wide' => ['sometimes', 'boolean'],
            'is_leg_bye' => ['sometimes', 'boolean'],
            'is_bye' => ['sometimes', 'boolean'],
            'is_free_hit' => ['sometimes', 'boolean'],
            'penalty_runs' => ['sometimes', 'integer', 'min:0', 'max:255'],
            'is_wicket' => ['sometimes', 'boolean'],
            'dismissal_type' => ['nullable', 'string', Rule::in(DismissalTypeEnum::values())],
            'out_player_id' => ['nullable', 'integer', 'exists:users,id'],
            'fielder_id' => ['nullable', 'integer', 'exists:users,id'],
            'shot_position' => ['nullable', 'string', Rule::in(ShotPositionEnum::values())],
        ];

        if ($isWicket) {
            $rules['dismissal_type'][0] = 'required';
            $rules['out_player_id'][0] = 'required';

            if ($fielderRequired) {
                $rules['fielder_id'][0] = 'required';
            }

            // Enforce free-hit dismissal restriction on updates too.
            if ($isFreeHit && $dismissalType !== null) {
                $validOnFreeHit = ['run_out', 'obstructing_the_field', 'hit_ball_twice'];
                if (! in_array($dismissalType, $validOnFreeHit, true)) {
                    $rules['dismissal_type'][] = Rule::in($validOnFreeHit);
                }
            }
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'dismissal_type.in' => 'On a free-hit delivery only run out, obstructing the field, or hitting the ball twice are valid dismissals.',
        ];
    }
}
