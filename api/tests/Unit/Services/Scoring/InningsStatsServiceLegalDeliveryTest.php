<?php

namespace Tests\Unit\Services\Scoring;

use App\Models\Ball;
use App\Services\InningsStatsService;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\Scoring\BallFactory;
use Tests\Support\Scoring\PlayerIds;

/**
 * Legal delivery classification and ball-counting rules.
 *
 * These tests guard over progression — a miscounted wide/no-ball can corrupt
 * overs display, bowler figures, and innings completion.
 */
class InningsStatsServiceLegalDeliveryTest extends ScoringUnitTestCase
{
    /**
     * @return array<string, array{0: Ball, 1: bool}>
     */
    public static function legalDeliveryCasesProvider(): array
    {
        return [
            'dot ball is legal' => [BallFactory::dot(), true],
            'single is legal' => [BallFactory::legal(1), true],
            'four is legal' => [BallFactory::legal(4), true],
            'six is legal' => [BallFactory::legal(6), true],
            'bye on legal delivery is legal' => [BallFactory::bye(2), true],
            'leg bye on legal delivery is legal' => [BallFactory::legBye(1), true],
            'wide is illegal' => [BallFactory::wide(), false],
            'wide with extra runs is illegal' => [BallFactory::wide(5), false],
            'no ball is illegal' => [BallFactory::noBall(), false],
            'no ball with runs off bat is illegal' => [BallFactory::noBall(4), false],
            'no ball bye is illegal' => [BallFactory::noBallBye(2), false],
            'penalty-only award is illegal' => [BallFactory::penalty(5), false],
            'additional-runs-only is illegal' => [BallFactory::additionalRuns(3), false],
            'dont_count_ball overrides legal shape' => [
                BallFactory::make(['runs' => 1, 'runs_off_bat' => 1, 'dont_count_ball' => true]),
                false,
            ],
        ];
    }

    #[DataProvider('legalDeliveryCasesProvider')]
    public function test_is_legal_delivery(Ball $ball, bool $expectedLegal): void
    {
        $this->assertSame($expectedLegal, $ball->isLegalDelivery());
    }

    public function test_six_legal_deliveries_count_as_one_complete_over(): void
    {
        $balls = BallFactory::withPositions(array_fill(0, 6, BallFactory::dot()));

        $stats = $this->compute($balls);

        $this->assertSame(6, $stats['legal_balls']);
        $this->assertSame('1.0', InningsStatsService::oversDisplay($stats['legal_balls']));
    }

    /**
     * Wide after the 6th legal ball must not advance the over counter — the wide
     * belongs to the completed over's illegal extras.
     */
    public function test_wide_after_sixth_legal_stays_in_same_over_index(): void
    {
        $balls = BallFactory::withPositions([
            ...array_fill(0, 6, BallFactory::dot()),
            BallFactory::wide(),
        ]);

        $details = InningsStatsService::currentOverDetails(BallFactory::collection($balls));

        $this->assertSame(1, $details['over_number'], 'Over index should be 1 after completing over 0');
        $this->assertSame(0, $details['balls_in_current_over']);
        $this->assertTrue($details['over_complete']);
    }

    /**
     * No-ball after 6th legal ball similarly does not consume a legal ball slot
     * in the new over.
     */
    public function test_no_ball_after_sixth_legal_does_not_start_new_over_prematurely(): void
    {
        $balls = BallFactory::withPositions([
            ...array_fill(0, 6, BallFactory::dot()),
            BallFactory::noBall(),
        ]);

        $position = InningsStatsService::nextBallPosition(BallFactory::collection($balls));

        $this->assertSame(1, $position['over']);
        $this->assertSame(2, $position['ball_in_over']);
    }

    /**
     * Penalty-only rows must not increment legal balls or affect over tracking.
     */
    public function test_penalty_only_award_does_not_count_toward_overs(): void
    {
        $balls = [
            BallFactory::dot(),
            BallFactory::penalty(5),
            BallFactory::dot(),
        ];

        $stats = $this->compute($balls);

        $this->assertSame(2, $stats['legal_balls']);
        $this->assertSame(5, $stats['total_runs']);
    }

    public function test_dont_count_ball_excluded_from_legal_count(): void
    {
        $balls = [
            BallFactory::dot(),
            BallFactory::make(['runs' => 0, 'runs_off_bat' => 0, 'dont_count_ball' => true]),
            BallFactory::dot(),
        ];

        $stats = $this->compute($balls);

        $this->assertSame(2, $stats['legal_balls']);
    }

    /**
     * @return array<string, array{0: int, 1: string}>
     */
    public static function oversDisplayProvider(): array
    {
        return [
            '0 balls' => [0, '0.0'],
            '1 ball' => [1, '0.1'],
            '5 balls' => [5, '0.5'],
            '6 balls complete over' => [6, '1.0'],
            '7 balls' => [7, '1.1'],
            '12 balls two overs' => [12, '2.0'],
            '13 balls' => [13, '2.1'],
        ];
    }

    #[DataProvider('oversDisplayProvider')]
    public function test_overs_display_format(int $legalBalls, string $expected): void
    {
        $this->assertSame($expected, InningsStatsService::oversDisplay($legalBalls));
    }
}
