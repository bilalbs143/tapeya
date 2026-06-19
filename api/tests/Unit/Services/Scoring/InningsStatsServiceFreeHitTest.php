<?php

namespace Tests\Unit\Services\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use PHPUnit\Framework\Attributes\DataProvider;
use App\Services\InningsStatsService;
use Tests\Support\Scoring\BallFactory;

/**
 * Free-hit chain behaviour per Law 21.18.
 */
class InningsStatsServiceFreeHitTest extends ScoringUnitTestCase
{
    public function test_no_ball_sets_next_is_free_hit(): void
    {
        $details = InningsStatsService::currentOverDetails(
            BallFactory::collection([BallFactory::noBall()]),
        );

        $this->assertTrue($details['next_is_free_hit']);
    }

    public function test_legal_delivery_after_no_ball_clears_free_hit(): void
    {
        $balls = [
            BallFactory::noBall(),
            BallFactory::make(['is_free_hit' => true, 'runs' => 0, 'runs_off_bat' => 0]),
            BallFactory::dot(),
        ];

        $details = InningsStatsService::currentOverDetails(BallFactory::collection($balls));

        $this->assertFalse($details['next_is_free_hit']);
    }

    public function test_free_hit_wide_keeps_free_hit_for_next_delivery(): void
    {
        $balls = [
            BallFactory::noBall(),
            BallFactory::make(['is_free_hit' => true, 'is_wide' => true, 'runs' => 1]),
        ];

        $this->assertTrue(InningsStatsService::isFreeHitDelivery($balls[1]));
        $details = InningsStatsService::currentOverDetails(BallFactory::collection($balls));
        $this->assertTrue($details['next_is_free_hit']);
    }

    public function test_free_hit_no_ball_keeps_free_hit_chain(): void
    {
        $balls = [
            BallFactory::noBall(),
            BallFactory::make(['is_free_hit' => true, 'is_no_ball' => true, 'runs' => 1]),
        ];

        $details = InningsStatsService::currentOverDetails(BallFactory::collection($balls));
        $this->assertTrue($details['next_is_free_hit']);
    }

    /**
     * @return array<string, array{0: DismissalTypeEnum, 1: bool}>
     */
    public static function freeHitDismissalValidityProvider(): array
    {
        return [
            'run out valid' => [DismissalTypeEnum::RUN_OUT, true],
            'obstructing valid' => [DismissalTypeEnum::OBSTRUCTING_THE_FIELD, true],
            'hit ball twice valid' => [DismissalTypeEnum::HIT_BALL_TWICE, true],
            'bowled invalid' => [DismissalTypeEnum::BOWLED, false],
            'caught invalid' => [DismissalTypeEnum::CAUGHT, false],
            'stumped invalid' => [DismissalTypeEnum::STUMPED, false],
            'lbw invalid' => [DismissalTypeEnum::LBW, false],
            'mankad invalid' => [DismissalTypeEnum::MANKAD, false],
        ];
    }

    #[DataProvider('freeHitDismissalValidityProvider')]
    public function test_dismissal_valid_on_free_hit(DismissalTypeEnum $type, bool $valid): void
    {
        $this->assertSame($valid, $type->validOnFreeHit());
    }
}
