<?php

namespace App\Http\Requests\User;

use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\NoBallRunsTypeEnum;
use App\Enums\Event\NoBallTypeEnum;
use App\Enums\Event\OverthrowDeliveryTypeEnum;
use App\Enums\Event\PenaltyReasonEnum;
use App\Enums\Event\PenaltyTeamEnum;
use App\Enums\Event\ShotPositionEnum;
use App\Models\Ball;
use Illuminate\Contracts\Validation\Validator;
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

        // Derive fielder requirement directly from the enum so this list never drifts
        // when DismissalTypeEnum::requiresFielder() is updated (e.g. MANKAD was added).
        $dismissalEnum = DismissalTypeEnum::tryFrom($dismissalType ?? '');
        $fielderRequired = $dismissalEnum?->requiresFielder() ?? false;

        // over, ball_in_over, is_free_hit are not updatable — position in the
        // innings is fixed; free-hit depends on the previous ball, not this one.
        // extra_runs + runs_off_bat drive runs recomputation in the controller.
        $rules = [
            'striker_id' => ['sometimes', 'integer', 'exists:users,id'],
            'non_striker_id' => ['sometimes', 'integer', 'exists:users,id'],
            'bowler_id' => ['sometimes', 'integer', 'exists:users,id'],
            'runs_off_bat' => ['sometimes', 'integer', 'min:0', 'max:255'],
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
     *
     * R1: wide + no-ball mutual exclusion.
     * R3: non_striker_id must differ from the stored striker_id (not just the patched one),
     *     because the `different:striker_id` rule only fires when striker_id is also in the
     *     patch — if only non_striker_id is sent, the comparison target is absent.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            /** @var Ball|null $ball */
            $ball = $this->route('ball');

            // R1: wide and no-ball cannot both be true.
            $isWide = $this->filled('is_wide')
                ? $this->boolean('is_wide')
                : (bool) ($ball?->is_wide ?? false);

            $isNoBall = $this->filled('is_no_ball')
                ? $this->boolean('is_no_ball')
                : (bool) ($ball?->is_no_ball ?? false);

            if ($isWide && $isNoBall) {
                $validator->errors()->add(
                    'is_wide',
                    'A delivery cannot be both a wide and a no-ball at the same time.',
                );
            }

            // R3: non_striker_id must not match the effective striker_id (request or stored).
            if ($this->filled('non_striker_id') && $ball !== null) {
                $effectiveStrikerId = $this->filled('striker_id')
                    ? (int) $this->input('striker_id')
                    : (int) $ball->striker_id;

                if ((int) $this->input('non_striker_id') === $effectiveStrikerId) {
                    $validator->errors()->add(
                        'non_striker_id',
                        'The non-striker must be different from the striker.',
                    );
                }
            }
        });
    }
}
