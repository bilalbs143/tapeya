<?php

namespace App\Http\Requests\User;

use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\NoBallRunsTypeEnum;
use App\Enums\Event\NoBallTypeEnum;
use App\Enums\Event\OverthrowDeliveryTypeEnum;
use App\Enums\Event\PenaltyReasonEnum;
use App\Enums\Event\PenaltyTeamEnum;
use App\Enums\Event\ShotPositionEnum;
use Illuminate\Contracts\Validation\Validator;
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
        $isWicket = $this->boolean('is_wicket');

        // Derive fielder requirement directly from the enum so this list never drifts
        // when DismissalTypeEnum::requiresFielder() is updated (e.g. MANKAD was added).
        $dismissalEnum = DismissalTypeEnum::tryFrom($dismissalType ?? '');
        $fielderRequired = $dismissalEnum?->requiresFielder() ?? false;

        // is_free_hit is server-computed (was last ball a no-ball?).
        // over, ball_in_over, runs are also server-computed.
        // extra_runs covers byes/leg-byes/overthrows beyond bat runs.
        $rules = [
            'striker_id' => ['required', 'integer', 'exists:users,id'],
            'non_striker_id' => ['required', 'integer', 'exists:users,id', 'different:striker_id'],
            'bowler_id' => ['required', 'integer', 'exists:users,id'],
            'runs_off_bat' => ['required', 'integer', 'min:0', 'max:255'],
            'extra_runs' => ['sometimes', 'integer', 'min:0', 'max:255'],
            'is_no_ball' => ['sometimes', 'boolean'],
            'no_ball_type' => ['nullable', 'string', Rule::in(NoBallTypeEnum::values())],
            'no_ball_runs_type' => ['nullable', 'string', Rule::in(NoBallRunsTypeEnum::values())],
            'overthrow_delivery_type' => ['nullable', 'string', Rule::in(OverthrowDeliveryTypeEnum::values())],
            'is_wide' => ['sometimes', 'boolean'],
            'is_leg_bye' => ['sometimes', 'boolean'],
            'is_bye' => ['sometimes', 'boolean'],
            'penalty_runs' => ['sometimes', 'integer', 'min:-999', 'max:999'],
            'penalty_team' => ['nullable', 'string', Rule::in(PenaltyTeamEnum::values())],
            'penalty_reason' => ['nullable', 'string', Rule::in(PenaltyReasonEnum::values())],
            'is_wicket' => ['sometimes', 'boolean'],
            'dismissal_type' => ['nullable', 'string', Rule::in(DismissalTypeEnum::values())],
            'out_player_id' => ['nullable', 'integer', 'exists:users,id'],
            'fielder_id' => ['nullable', 'integer', 'exists:users,id'],
            'runout_extra_runs' => ['nullable', 'integer', 'min:0', 'max:6'],
            'runout_run_type' => ['nullable', 'string', Rule::in(NoBallRunsTypeEnum::values())],
            'batter_crossed' => ['nullable', 'boolean'],
            'dont_count_ball' => ['nullable', 'boolean'],
            'dismissal_delivery_type' => ['nullable', 'string', Rule::in(OverthrowDeliveryTypeEnum::values())],
            'shot_position' => ['nullable', 'string', Rule::in(ShotPositionEnum::values())],
        ];

        if ($isWicket) {
            $rules['dismissal_type'] = ['required', 'string', Rule::in(DismissalTypeEnum::values())];
            $rules['out_player_id'] = ['required', 'integer', 'exists:users,id'];

            if ($fielderRequired) {
                $rules['fielder_id'] = ['required', 'integer', 'exists:users,id'];
            }
        }

        return $rules;
    }

    /**
     * Cross-field validation that cannot be expressed as simple rule strings.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            // A delivery cannot be both a wide AND a no-ball simultaneously.
            if ($this->boolean('is_wide') && $this->boolean('is_no_ball')) {
                $validator->errors()->add(
                    'is_wide',
                    'A delivery cannot be both a wide and a no-ball at the same time.',
                );
            }
        });
    }
}
