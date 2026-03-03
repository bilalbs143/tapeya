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
        $fielderRequired = in_array($this->input('dismissal_type'), ['caught', 'run_out', 'stumped'], true);

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
            'penalty_runs' => ['sometimes', 'integer', 'min:0', 'max:255'],
            'is_wicket' => ['sometimes', 'boolean'],
            'dismissal_type' => ['nullable', 'string', Rule::in(DismissalTypeEnum::values())],
            'out_player_id' => ['nullable', 'integer', 'exists:users,id'],
            'fielder_id' => ['nullable', 'integer', 'exists:users,id'],
            'shot_position' => ['nullable', 'string', Rule::in(ShotPositionEnum::values())],
        ];

        if ($this->boolean('is_wicket')) {
            $rules['dismissal_type'][0] = 'required';
            $rules['out_player_id'][0] = 'required';
            if ($fielderRequired) {
                $rules['fielder_id'][0] = 'required';
            }
        }

        return $rules;
    }
}
