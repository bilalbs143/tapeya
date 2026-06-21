<?php

namespace Tests\Unit\Services\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\PenaltyTeamEnum;
use App\Services\InningsStatsService;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\Scoring\BallFactory;
use Tests\Support\Scoring\PlayerIds;

/**
 * Team totals, extras breakdown, and per-player batting aggregates.
 */
class InningsStatsServiceComputeTest extends ScoringUnitTestCase
{
    public function test_empty_innings_returns_zero_totals(): void
    {
        $stats = $this->compute([]);

        $this->assertSame(0, $stats['total_runs']);
        $this->assertSame(0, $stats['total_wickets']);
        $this->assertSame(0, $stats['legal_balls']);
        $this->assertSame(0, $stats['extras_breakdown']['total']);
    }

    /**
     * @return array<string, array{0: int, 1: int, 2: int, 3: int, 4: int, 5: int}>
     */
    public static function runScoringProvider(): array
    {
        return [
            'dot' => [0, 1, 0, 0, 0, 0],
            'single' => [1, 0, 0, 1, 0, 0],
            'double' => [2, 0, 0, 0, 1, 0],
            'triple' => [3, 0, 0, 0, 0, 1],
            'four' => [4, 0, 1, 0, 0, 0],
            'six' => [6, 0, 0, 0, 0, 0], // sixes counted separately
        ];
    }

    #[DataProvider('runScoringProvider')]
    public function test_batting_boundary_and_run_type_counts(
        int $runs,
        int $expectedDots,
        int $expectedFours,
        int $expectedOnes,
        int $expectedTwos,
        int $expectedThrees,
    ): void {
        $stats = $this->compute([BallFactory::legal($runs)]);
        $bat = $stats['batting_by_id'][PlayerIds::STRIKER];

        $this->assertSame($runs, $bat['runs']);
        $this->assertSame(1, $bat['balls']);
        $this->assertSame($expectedDots, $bat['dots']);
        $this->assertSame($expectedFours, $bat['fours']);
        $this->assertSame($expectedOnes, $bat['ones']);
        $this->assertSame($expectedTwos, $bat['twos']);
        $this->assertSame($expectedThrees, $bat['threes']);
        if ($runs === 6) {
            $this->assertSame(1, $bat['sixes']);
        }
    }

    public function test_wide_runs_are_extras_not_batter_runs(): void
    {
        $stats = $this->compute([BallFactory::wide(5)]);

        $this->assertSame(5, $stats['total_runs']);
        $this->assertSame(5, $stats['extras_breakdown']['wides']);
        $this->assertSame(0, $stats['batting_by_id'][PlayerIds::STRIKER]['runs']);
        $this->assertSame(0, $stats['batting_by_id'][PlayerIds::STRIKER]['balls']);
    }

    public function test_no_ball_with_four_credits_batter_and_nb_extras(): void
    {
        $stats = $this->compute([BallFactory::noBall(4)]);

        $this->assertSame(5, $stats['total_runs']);
        $this->assertSame(1, $stats['extras_breakdown']['no_balls']);
        $this->assertSame(4, $stats['batting_by_id'][PlayerIds::STRIKER]['runs']);
        $this->assertSame(1, $stats['batting_by_id'][PlayerIds::STRIKER]['fours']);
        $this->assertSame(0, $stats['batting_by_id'][PlayerIds::STRIKER]['balls'], 'No-ball does not count as ball faced');
    }

    public function test_byes_are_extras_with_zero_off_bat(): void
    {
        $stats = $this->compute([BallFactory::bye(3)]);

        $this->assertSame(3, $stats['total_runs']);
        $this->assertSame(3, $stats['extras_breakdown']['byes']);
        $this->assertSame(0, $stats['batting_by_id'][PlayerIds::STRIKER]['runs']);
        $this->assertSame(1, $stats['batting_by_id'][PlayerIds::STRIKER]['balls']);
    }

    public function test_leg_byes_are_extras_with_zero_off_bat(): void
    {
        $stats = $this->compute([BallFactory::legBye(2)]);

        $this->assertSame(2, $stats['extras_breakdown']['leg_byes']);
    }

    public function test_penalty_runs_add_to_total_and_extras(): void
    {
        $stats = $this->compute([
            BallFactory::dot(),
            BallFactory::penalty(5),
        ]);

        $this->assertSame(5, $stats['total_runs']);
        $this->assertSame(5, $stats['extras_breakdown']['penalty_runs']);
    }

    public function test_additional_runs_add_to_total_not_extras_breakdown(): void
    {
        $stats = $this->compute([BallFactory::additionalRuns(7)]);

        $this->assertSame(7, $stats['total_runs']);
        $this->assertSame(0, $stats['extras_breakdown']['total']);
    }

    public function test_negative_penalty_deducts_runs(): void
    {
        $stats = $this->compute([
            BallFactory::legal(10),
            BallFactory::make([
                'penalty_runs' => -3,
                'penalty_team' => PenaltyTeamEnum::BATTING->value,
            ]),
        ]);

        $this->assertSame(7, $stats['total_runs']);
        $this->assertSame(-3, $stats['extras_breakdown']['penalty_runs']);
    }

    public function test_bowling_side_penalty_not_in_innings_total_until_cross_innings_apply(): void
    {
        $stats = $this->compute([
            BallFactory::make([
                'penalty_runs' => 5,
                'penalty_team' => PenaltyTeamEnum::BOWLING->value,
            ]),
        ]);

        $this->assertSame(0, $stats['total_runs']);
        $applied = InningsStatsService::applyCrossInningsPenalties($stats, 5);
        $this->assertSame(5, $applied['total_runs']);
    }

    public function test_wicket_increments_total_wickets_and_fow(): void
    {
        $stats = $this->compute([
            BallFactory::legal(4),
            BallFactory::wicket(DismissalTypeEnum::BOWLED),
        ]);

        $this->assertSame(1, $stats['total_wickets']);
        $this->assertCount(1, $stats['fall_of_wickets']);
        $this->assertSame(4, $stats['fall_of_wickets'][0]['score']);
        $this->assertSame('0.2', $stats['fall_of_wickets'][0]['overs']);
    }

    /**
     * Retired hurt records dismissal but must NOT count as a wicket — batter may return.
     */
    public function test_retired_hurt_is_not_a_wicket(): void
    {
        $stats = $this->compute([
            BallFactory::wicket(DismissalTypeEnum::RETIRED_HURT, PlayerIds::STRIKER),
        ]);

        $this->assertSame(0, $stats['total_wickets']);
        $this->assertCount(0, $stats['fall_of_wickets']);
        $this->assertTrue($stats['batting_by_id'][PlayerIds::STRIKER]['dismissal_type'] === 'retired_hurt');
    }

    public function test_retired_out_counts_as_wicket_not_bowler_wicket(): void
    {
        $stats = $this->compute([
            BallFactory::wicket(DismissalTypeEnum::RETIRED, PlayerIds::STRIKER),
        ]);

        $this->assertSame(1, $stats['total_wickets']);
        $this->assertSame(0, $stats['bowling_by_id'][PlayerIds::BOWLER]['wickets']);
    }

    /**
     * Runs completed before a run-out must be included in the innings total.
     */
    public function test_run_out_with_completed_runs_adds_runs_to_total(): void
    {
        $stats = $this->compute([
            BallFactory::runOut(PlayerIds::STRIKER, crossed: false, runsBeforeDismissal: 2),
        ]);

        $this->assertSame(2, $stats['total_runs']);
        $this->assertSame(1, $stats['total_wickets']);
    }

    public function test_striker_runs_off_bat_legacy_fallback_when_only_runs_set(): void
    {
        $ball = BallFactory::make(['runs' => 3, 'runs_off_bat' => 0]);

        $this->assertSame(3, InningsStatsService::strikerRunsOffBat($ball));
    }

    public function test_striker_runs_off_bat_on_no_ball_derives_from_total_minus_penalty(): void
    {
        $ball = BallFactory::make([
            'is_no_ball' => true,
            'runs' => 5,
            'runs_off_bat' => 0,
        ]);

        $this->assertSame(4, InningsStatsService::strikerRunsOffBat($ball));
    }

    public function test_extras_total_equals_sum_of_components(): void
    {
        $stats = $this->compute([
            BallFactory::wide(2),
            BallFactory::noBall(1),
            BallFactory::bye(1),
            BallFactory::legBye(1),
            BallFactory::penalty(3),
        ]);

        $extras = $stats['extras_breakdown'];
        $this->assertSame(
            $extras['wides'] + $extras['no_balls'] + $extras['byes'] + $extras['leg_byes'] + $extras['penalty_runs'],
            $extras['total'],
        );
    }

    public function test_dismissed_ids_excludes_retired_hurt(): void
    {
        $balls = BallFactory::collection([
            BallFactory::wicket(DismissalTypeEnum::RETIRED_HURT, PlayerIds::STRIKER),
            BallFactory::wicket(DismissalTypeEnum::BOWLED, PlayerIds::STRIKER),
        ]);

        $this->assertSame([PlayerIds::STRIKER], InningsStatsService::dismissedPlayerIdsFromBalls($balls));
    }
}
