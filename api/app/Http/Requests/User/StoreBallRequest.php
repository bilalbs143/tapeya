<?php

namespace App\Http\Requests\User;

use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\ShotPositionEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBallRequest extends FormRequest
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
        $dismissalType = $this->input('dismissal_type');
        $isFreeHit = $this->boolean('is_free_hit');
        $isWicket = $this->boolean('is_wicket');
        $fielderRequired = in_array($dismissalType, ['caught', 'run_out', 'stumped'], true);

        $rules = [
            'over' => ['required', 'integer', 'min:0'],
            'ball_in_over' => ['required', 'integer', 'min:1', 'max:7'],
            'striker_id' => ['required', 'integer', 'exists:users,id'],
            'non_striker_id' => ['required', 'integer', 'exists:users,id', 'different:striker_id'],
            'bowler_id' => ['required', 'integer', 'exists:users,id'],
            'runs' => ['required', 'integer', 'min:0', 'max:255'],
            'runs_off_bat' => ['required', 'integer', 'min:0', 'max:255'],
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

            // Law 21.18 — on a free-hit only run_out, obstructing_the_field,
            // and hit_ball_twice are valid dismissals.
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
