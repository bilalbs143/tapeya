<?php

namespace Tests\Unit\Services\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use PHPUnit\Framework\Attributes\DataProvider;

/**
 * Dismissal enum rules used by ScorecardController validation.
 */
class DismissalValidationTest extends ScoringUnitTestCase
{
    /**
     * @return array<string, array{0: DismissalTypeEnum, 1: bool}>
     */
    public static function wideDismissalProvider(): array
    {
        return [
            'run out on wide' => [DismissalTypeEnum::RUN_OUT, true],
            'stumped on wide' => [DismissalTypeEnum::STUMPED, true],
            'obstructing on wide' => [DismissalTypeEnum::OBSTRUCTING_THE_FIELD, true],
            'bowled on wide invalid' => [DismissalTypeEnum::BOWLED, false],
            'caught on wide invalid' => [DismissalTypeEnum::CAUGHT, false],
            'lbw on wide invalid' => [DismissalTypeEnum::LBW, false],
        ];
    }

    #[DataProvider('wideDismissalProvider')]
    public function test_valid_on_wide_delivery(DismissalTypeEnum $type, bool $valid): void
    {
        $this->assertSame($valid, $type->validOnWideDelivery());
    }

    /**
     * @return array<string, array{0: DismissalTypeEnum, 1: bool}>
     */
    public static function noBallDismissalProvider(): array
    {
        return [
            'run out on no ball' => [DismissalTypeEnum::RUN_OUT, true],
            'obstructing on no ball' => [DismissalTypeEnum::OBSTRUCTING_THE_FIELD, true],
            'hit twice on no ball' => [DismissalTypeEnum::HIT_BALL_TWICE, true],
            'bowled on no ball invalid' => [DismissalTypeEnum::BOWLED, false],
            'caught on no ball invalid' => [DismissalTypeEnum::CAUGHT, false],
        ];
    }

    #[DataProvider('noBallDismissalProvider')]
    public function test_valid_on_no_ball_delivery(DismissalTypeEnum $type, bool $valid): void
    {
        $this->assertSame($valid, $type->validOnNoBallDelivery());
    }

    /**
     * @return array<string, array{0: DismissalTypeEnum, 1: bool}>
     */
    public static function countsAsWicketProvider(): array
    {
        return [
            'bowled is wicket' => [DismissalTypeEnum::BOWLED, true],
            'retired out is wicket' => [DismissalTypeEnum::RETIRED, true],
            'retired hurt is not wicket' => [DismissalTypeEnum::RETIRED_HURT, false],
        ];
    }

    #[DataProvider('countsAsWicketProvider')]
    public function test_counts_as_wicket(DismissalTypeEnum $type, bool $counts): void
    {
        $this->assertSame($counts, $type->countsAsWicket());
    }
}
