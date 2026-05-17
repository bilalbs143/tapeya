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
        $isWicket = $this->filled('is_wicket') ? $this->boolean('is_wicket') : ($ball?->is_wicket ?? false);
        $fielderRequired = in_array($dismissalType, ['caught', 'run_out', 'stumped'], true);

        // over, ball_in_over, is_free_hit are not updatable — position in the
        // innings is fixed; free-hit depends on the previous ball, not this one.
        // extra_runs + runs_off_bat drive runs recomputation in the controller.
        $rules = [
            'striker_id' => ['sometimes', 'integer', 'exists:users,id'],
            'non_striker_id' => ['sometimes', 'integer', 'exists:users,id', 'different:striker_id'],
            'bowler_id' => ['sometimes', 'integer', 'exists:users,id'],
            'runs_off_bat' => ['sometimes', 'integer', 'min:0', 'max:255'],
            'extra_runs' => ['sometimes', 'integer', 'min:0', 'max:255'],
            'is_no_ball' => ['sometimes', 'boolean'],
            'is_wide' => ['sometimes', 'boolean'],
            'is_leg_bye' => ['sometimes', 'boolean'],
            'is_bye' => ['sometimes', 'boolean'],
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
        }

        return $rules;
    }
}
