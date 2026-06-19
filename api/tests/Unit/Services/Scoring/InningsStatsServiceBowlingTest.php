<?php

namespace Tests\Unit\Services\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\Scoring\BallFactory;
use Tests\Support\Scoring\PlayerIds;

/**
 * Bowler statistics: runs conceded, wickets credited, maidens, dots.
 */
class InningsStatsServiceBowlingTest extends ScoringUnitTestCase
{
    public function test_maiden_over_six_legal_dots(): void
    {
        $stats = $this->compute(BallFactory::withPositions(array_fill(0, 6, BallFactory::dot())));

        $bowler = $stats['bowling_by_id'][PlayerIds::BOWLER];
        $this->assertSame(6, $bowler['balls']);
        $this->assertSame(0, $bowler['runs']);
        $this->assertSame(1, $bowler['maidens']);
        $this->assertSame(6, $bowler['dots']);
    }

    /**
     * Byes and leg-byes must not count against the bowler's runs or maiden.
     */
    public function test_byes_and_leg_byes_not_charged_to_bowler(): void
    {
        $stats = $this->compute(BallFactory::withPositions([
            BallFactory::bye(2),
            BallFactory::legBye(1),
            ...array_fill(0, 4, BallFactory::dot()),
        ]));

        $bowler = $stats['bowling_by_id'][PlayerIds::BOWLER];
        $this->assertSame(0, $bowler['runs']);
        $this->assertSame(1, $bowler['maidens']);
    }

    public function test_wide_runs_charged_to_bowler(): void
    {
        $stats = $this->compute([BallFactory::wide(5)]);

        $this->assertSame(5, $stats['bowling_by_id'][PlayerIds::BOWLER]['runs']);
    }

    public function test_no_ball_runs_charged_to_bowler(): void
    {
        $stats = $this->compute([BallFactory::noBall(4)]);

        $this->assertSame(5, $stats['bowling_by_id'][PlayerIds::BOWLER]['runs']);
    }

    /**
     * @return array<string, array{0: DismissalTypeEnum, 1: bool}>
     */
    public static function bowlerWicketCreditProvider(): array
    {
        return [
            'bowled credits bowler' => [DismissalTypeEnum::BOWLED, true],
            'caught credits bowler' => [DismissalTypeEnum::CAUGHT, true],
            'stumped credits bowler' => [DismissalTypeEnum::STUMPED, true],
            'lbw credits bowler' => [DismissalTypeEnum::LBW, true],
            'hit wicket credits bowler' => [DismissalTypeEnum::HIT_WICKET, true],
            'run out does not credit bowler' => [DismissalTypeEnum::RUN_OUT, false],
            'mankad does not credit bowler' => [DismissalTypeEnum::MANKAD, false],
            'obstructing does not credit bowler' => [DismissalTypeEnum::OBSTRUCTING_THE_FIELD, false],
            'hit ball twice does not credit bowler' => [DismissalTypeEnum::HIT_BALL_TWICE, false],
            'retired out does not credit bowler' => [DismissalTypeEnum::RETIRED, false],
            'timed out does not credit bowler' => [DismissalTypeEnum::TIMED_OUT, false],
        ];
    }

    #[DataProvider('bowlerWicketCreditProvider')]
    public function test_bowler_wicket_credit(DismissalTypeEnum $type, bool $creditsBowler): void
    {
        $stats = $this->compute([
            BallFactory::wicket($type, PlayerIds::STRIKER, extra: ['fielder_id' => PlayerIds::FIELDER]),
        ]);

        $expected = $creditsBowler ? 1 : 0;
        $this->assertSame($expected, $stats['bowling_by_id'][PlayerIds::BOWLER]['wickets']);
    }

    public function test_wide_does_not_count_as_bowling_ball(): void
    {
        $stats = $this->compute([BallFactory::wide()]);

        $this->assertSame(0, $stats['bowling_by_id'][PlayerIds::BOWLER]['balls']);
    }

    public function test_no_ball_does_not_count_as_bowling_ball(): void
    {
        $stats = $this->compute([BallFactory::noBall()]);

        $this->assertSame(0, $stats['bowling_by_id'][PlayerIds::BOWLER]['balls']);
    }

    public function test_economy_rate_calculation(): void
    {
        $stats = $this->compute(BallFactory::withPositions([
            BallFactory::legal(4),
            BallFactory::legal(4),
            BallFactory::legal(4),
            BallFactory::legal(4),
            BallFactory::legal(4),
            BallFactory::legal(4),
        ]));

        $bowler = collect($stats['bowling'])->firstWhere('id', PlayerIds::BOWLER);
        $this->assertSame('24.00', $bowler['economy']);
    }

    public function test_run_with_one_legal_ball_not_maiden(): void
    {
        $stats = $this->compute(BallFactory::withPositions([
            BallFactory::legal(1),
            ...array_fill(0, 5, BallFactory::dot()),
        ]));

        $this->assertSame(0, $stats['bowling_by_id'][PlayerIds::BOWLER]['maidens']);
    }

    public function test_two_bowlers_tracked_separately(): void
    {
        $stats = $this->compute([
            BallFactory::make(['bowler_id' => PlayerIds::BOWLER, 'runs' => 1, 'runs_off_bat' => 1]),
            BallFactory::make(['bowler_id' => PlayerIds::BOWLER_2, 'runs' => 4, 'runs_off_bat' => 4]),
        ]);

        $this->assertCount(2, $stats['bowling']);
        $this->assertSame(1, $stats['bowling_by_id'][PlayerIds::BOWLER]['runs']);
        $this->assertSame(4, $stats['bowling_by_id'][PlayerIds::BOWLER_2]['runs']);
    }
}
