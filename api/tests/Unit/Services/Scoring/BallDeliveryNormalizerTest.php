<?php

namespace Tests\Unit\Services\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\NoBallRunsTypeEnum;
use App\Enums\Event\NoBallTypeEnum;
use App\Enums\Event\PenaltyReasonEnum;
use App\Enums\Event\PenaltyTeamEnum;
use App\Services\BallDeliveryNormalizer;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/**
 * Payload normalization before persistence — requires Laravel for ValidationException.
 */
class BallDeliveryNormalizerTest extends TestCase
{
    public function test_no_ball_requires_type_and_runs_type(): void
    {
        $this->expectException(ValidationException::class);

        BallDeliveryNormalizer::normalize([
            'is_no_ball' => true,
        ]);
    }

    public function test_no_ball_from_bat_normalizes_run_columns(): void
    {
        $data = BallDeliveryNormalizer::normalize([
            'is_no_ball' => true,
            'no_ball_type' => NoBallTypeEnum::OVER_FOOTED->value,
            'no_ball_runs_type' => NoBallRunsTypeEnum::FROM_BAT->value,
            'runs_off_bat' => 4,
        ]);

        $this->assertSame(4, $data['runs_off_bat']);
        $this->assertFalse($data['is_bye']);
        $this->assertFalse($data['is_leg_bye']);
    }

    public function test_no_ball_bye_sets_bye_flag(): void
    {
        $data = BallDeliveryNormalizer::normalize([
            'is_no_ball' => true,
            'no_ball_type' => NoBallTypeEnum::OVER_FOOTED->value,
            'no_ball_runs_type' => NoBallRunsTypeEnum::BYE->value,
            'extra_runs' => 2,
        ]);

        $this->assertTrue($data['is_bye']);
        $this->assertSame(0, $data['runs_off_bat']);
        $this->assertSame(2, $data['extra_runs']);
    }

    /**
     * Non-run-out no-ball + wicket strips NB type chips (run-out uses normalizeRunOut path).
     */
    public function test_combined_no_ball_wicket_strips_no_ball_type_chips(): void
    {
        $data = BallDeliveryNormalizer::normalize([
            'is_no_ball' => true,
            'is_wicket' => true,
            'dismissal_type' => DismissalTypeEnum::HIT_BALL_TWICE->value,
            'no_ball_type' => NoBallTypeEnum::OVER_FOOTED->value,
            'no_ball_runs_type' => NoBallRunsTypeEnum::FROM_BAT->value,
        ]);

        $this->assertArrayNotHasKey('no_ball_type', $data);
        $this->assertArrayNotHasKey('no_ball_runs_type', $data);
    }

    public function test_penalty_only_requires_reason(): void
    {
        $this->expectException(ValidationException::class);

        BallDeliveryNormalizer::normalize([
            'penalty_runs' => 5,
            'penalty_team' => PenaltyTeamEnum::BATTING->value,
        ]);
    }

    public function test_penalty_only_normalizes_successfully(): void
    {
        $data = BallDeliveryNormalizer::normalize([
            'penalty_runs' => 5,
            'penalty_team' => PenaltyTeamEnum::BATTING->value,
            'penalty_reason' => PenaltyReasonEnum::TIME_WASTING_BATTING->value,
        ]);

        $this->assertSame(5, $data['penalty_runs']);
        $this->assertFalse($data['dont_count_ball']);
    }

    public function test_retired_hurt_sets_dont_count_ball(): void
    {
        $data = BallDeliveryNormalizer::normalize([
            'is_wicket' => true,
            'dismissal_type' => DismissalTypeEnum::RETIRED_HURT->value,
            'dismissal_delivery_type' => 'fair',
        ]);

        $this->assertTrue($data['dont_count_ball']);
    }
}
