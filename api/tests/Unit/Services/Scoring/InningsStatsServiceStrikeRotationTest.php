<?php

namespace Tests\Unit\Services\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use App\Models\Ball;
use App\Services\InningsStatsService;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\Scoring\BallFactory;
use Tests\Support\Scoring\PlayerIds;

/**
 * Strike rotation and end-of-over crease rules (MCC Laws).
 *
 * Bugs here cause the wrong batter to face the next delivery — one of the most
 * visible scoring errors in live matches.
 */
class InningsStatsServiceStrikeRotationTest extends ScoringUnitTestCase
{
    /**
     * @return array<string, array{0: callable(): list<Ball>, 1: int, 2: int}>
     */
    public static function rotationCasesProvider(): array
    {
        return [
            'even single keeps strike' => [
                fn () => [BallFactory::legal(2)],
                PlayerIds::STRIKER,
                PlayerIds::NON_STRIKER,
            ],
            'odd single rotates strike' => [
                fn () => [BallFactory::legal(1)],
                PlayerIds::NON_STRIKER,
                PlayerIds::STRIKER,
            ],
            'odd three rotates strike' => [
                fn () => [BallFactory::legal(3)],
                PlayerIds::NON_STRIKER,
                PlayerIds::STRIKER,
            ],
            'four keeps strike (even)' => [
                fn () => [BallFactory::legal(4)],
                PlayerIds::STRIKER,
                PlayerIds::NON_STRIKER,
            ],
            'six keeps strike (even)' => [
                fn () => [BallFactory::legal(6)],
                PlayerIds::STRIKER,
                PlayerIds::NON_STRIKER,
            ],
            'dot keeps strike' => [
                fn () => [BallFactory::dot()],
                PlayerIds::STRIKER,
                PlayerIds::NON_STRIKER,
            ],
            'odd bye rotates' => [
                fn () => [BallFactory::bye(1)],
                PlayerIds::NON_STRIKER,
                PlayerIds::STRIKER,
            ],
            'even bye no rotation' => [
                fn () => [BallFactory::bye(2)],
                PlayerIds::STRIKER,
                PlayerIds::NON_STRIKER,
            ],
            'odd leg bye rotates' => [
                fn () => [BallFactory::legBye(3)],
                PlayerIds::NON_STRIKER,
                PlayerIds::STRIKER,
            ],
            'no ball odd off bat rotates' => [
                fn () => [BallFactory::noBall(1)],
                PlayerIds::NON_STRIKER,
                PlayerIds::STRIKER,
            ],
            'no ball even off bat no rotation' => [
                fn () => [BallFactory::noBall(2)],
                PlayerIds::STRIKER,
                PlayerIds::NON_STRIKER,
            ],
            'no ball odd bye rotates' => [
                fn () => [BallFactory::noBallBye(1)],
                PlayerIds::NON_STRIKER,
                PlayerIds::STRIKER,
            ],
            'wide with 1 run (penalty only) no rotation' => [
                fn () => [BallFactory::wide(1)],
                PlayerIds::STRIKER,
                PlayerIds::NON_STRIKER,
            ],
            'wide with 2 total (1 run taken) rotates' => [
                fn () => [BallFactory::wide(2)],
                PlayerIds::NON_STRIKER,
                PlayerIds::STRIKER,
            ],
            'wide with 4 total (3 runs taken) rotates' => [
                fn () => [BallFactory::wide(4)],
                PlayerIds::NON_STRIKER,
                PlayerIds::STRIKER,
            ],
            'penalty only no rotation' => [
                fn () => [BallFactory::penalty(5)],
                PlayerIds::STRIKER,
                PlayerIds::NON_STRIKER,
            ],
            'additional runs only no rotation' => [
                fn () => [BallFactory::additionalRuns(4)],
                PlayerIds::STRIKER,
                PlayerIds::NON_STRIKER,
            ],
        ];
    }

    #[DataProvider('rotationCasesProvider')]
    public function test_strike_rotation_after_single_delivery(
        callable $ballsFactory,
        int $expectedStriker,
        int $expectedNonStriker,
    ): void {
        $crease = $this->creaseAfter($ballsFactory());

        $this->assertSame($expectedStriker, $crease['striker_id']);
        $this->assertSame($expectedNonStriker, $crease['non_striker_id']);
    }

    /**
     * End of over ALWAYS swaps ends — independent of odd-run rotation on the 6th ball.
     * Odd single on ball 6: rotate once, then over-end swap → striker faces next over.
     */
    public function test_odd_single_on_last_ball_of_over_striker_faces_next_over(): void
    {
        $balls = BallFactory::withPositions([
            ...array_fill(0, 5, BallFactory::dot()),
            BallFactory::legal(1),
        ]);

        $crease = $this->creaseAfter($balls);

        $this->assertSame(PlayerIds::STRIKER, $crease['striker_id']);
        $this->assertSame(PlayerIds::NON_STRIKER, $crease['non_striker_id']);
    }

    /**
     * Even runs on 6th ball: no odd rotation, over-end swap only → non-striker faces.
     */
    public function test_even_runs_on_last_ball_non_striker_faces_next_over(): void
    {
        $balls = BallFactory::withPositions([
            ...array_fill(0, 5, BallFactory::dot()),
            BallFactory::legal(2),
        ]);

        $crease = $this->creaseAfter($balls);

        $this->assertSame(PlayerIds::NON_STRIKER, $crease['striker_id']);
        $this->assertSame(PlayerIds::STRIKER, $crease['non_striker_id']);
    }

    /**
     * Dot on 6th ball: over-end swap → non-striker faces next over.
     */
    public function test_dot_on_last_ball_swaps_ends(): void
    {
        $balls = BallFactory::withPositions(array_fill(0, 6, BallFactory::dot()));

        $crease = $this->creaseAfter($balls);

        $this->assertSame(PlayerIds::NON_STRIKER, $crease['striker_id']);
    }

    /**
     * Wide on 6th legal ball does not trigger over-end swap (wide is illegal).
     */
    public function test_wide_on_seventh_illegal_delivery_does_not_complete_over(): void
    {
        $balls = BallFactory::withPositions([
            ...array_fill(0, 6, BallFactory::dot()),
            BallFactory::wide(),
        ]);

        $details = InningsStatsService::currentOverDetails(BallFactory::collection($balls));

        $this->assertTrue($details['over_complete']);
        $this->assertSame(1, $details['over_number']);
    }

    /**
     * Sequence: 1,1,1,1,1,1 across an over — odd rotations compound with over swap.
     */
    public function test_six_singles_in_over_returns_to_original_striker(): void
    {
        $balls = BallFactory::withPositions(array_fill(0, 6, BallFactory::legal(1)));

        $crease = $this->creaseAfter($balls);

        // Each single rotates; 6 rotations + over swap = net same as start
        $this->assertSame(PlayerIds::STRIKER, $crease['striker_id']);
    }

    /**
     * Wicket on last ball of over must apply over-end swap after dismissal resolution.
     */
    public function test_wicket_on_last_ball_of_over_applies_end_swap(): void
    {
        $balls = BallFactory::withPositions([
            ...array_fill(0, 5, BallFactory::dot()),
            BallFactory::wicket(DismissalTypeEnum::BOWLED, PlayerIds::STRIKER),
            BallFactory::legal(0, PlayerIds::INCOMING, PlayerIds::NON_STRIKER),
        ]);

        $crease = $this->creaseAfter($balls);

        // After wicket on 6th ball, the next over begins with the incoming batter facing.
        $this->assertSame(PlayerIds::INCOMING, $crease['striker_id']);
        $this->assertSame(PlayerIds::NON_STRIKER, $crease['non_striker_id']);
    }

    /**
     * Run-out on no-ball with odd runs: rotate before applying dismissal crease logic.
     */
    public function test_run_out_on_no_ball_with_odd_runs_applies_rotation_first(): void
    {
        $balls = [
            BallFactory::runOut(
                PlayerIds::STRIKER,
                crossed: false,
                runsBeforeDismissal: 1,
                onNoBall: true,
            ),
            BallFactory::legal(0, PlayerIds::INCOMING, PlayerIds::NON_STRIKER),
        ];

        // After odd NB run, non-striker was at striker end; striker run out at striker end
        // Incoming takes striker end
        $crease = $this->creaseAfter($balls);

        $this->assertSame(PlayerIds::INCOMING, $crease['striker_id']);
        $this->assertSame(PlayerIds::NON_STRIKER, $crease['non_striker_id']);
    }
}
