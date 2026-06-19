<?php

namespace Tests\Unit\Services\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use App\Services\InningsStatsService;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\Scoring\BallFactory;
use Tests\Support\Scoring\PlayerIds;

/**
 * High-value edge-case combinations commonly missed in cricket scoring systems.
 *
 * Each test documents a specific law interaction that has caused production bugs
 * in other platforms or was flagged during this test initiative.
 */
class ScoringEdgeCasesTest extends ScoringUnitTestCase
{
    /**
     * Match-winning boundary with overthrows: all runs on the delivery count toward total.
     */
    public function test_boundary_plus_overthrow_runs_all_counted(): void
    {
        $stats = $this->compute([
            BallFactory::make(['runs' => 8, 'runs_off_bat' => 8]), // 4 + 4 overthrow
        ]);

        $this->assertSame(8, $stats['total_runs']);
        $this->assertSame(8, $stats['batting_by_id'][PlayerIds::STRIKER]['runs']);
    }

    /**
     * Chase-style scenario: extras on final delivery push score to target.
     */
    public function test_no_ball_plus_wide_sequence_accumulates_extras(): void
    {
        $stats = $this->compute([
            BallFactory::noBall(0),
            BallFactory::make(['is_free_hit' => true, 'is_wide' => true, 'runs' => 5, 'runs_off_bat' => 0]),
        ]);

        $this->assertSame(6, $stats['total_runs']); // 1 NB + 5 wide
        $this->assertSame(0, $stats['legal_balls']);
    }

    /**
     * Wicket on free hit with run-out — valid dismissal.
     */
    public function test_run_out_on_free_hit_counts_as_wicket(): void
    {
        $stats = $this->compute([
            BallFactory::make([
                'is_wicket' => true,
                'is_no_ball' => true,
                'is_free_hit' => true,
                'dismissal_type' => DismissalTypeEnum::RUN_OUT,
                'out_player_id' => PlayerIds::STRIKER,
                'fielder_id' => PlayerIds::FIELDER,
                'runs' => 1,
                'runs_off_bat' => 0,
            ]),
        ]);

        $this->assertSame(1, $stats['total_wickets']);
    }

    /**
     * Last ball of innings simulation: wicket on 6th ball with runs on delivery.
     */
    public function test_last_ball_wicket_with_runs_records_fow_at_full_score(): void
    {
        $balls = BallFactory::withPositions([
            ...array_fill(0, 5, BallFactory::legal(4)),
            BallFactory::wicket(DismissalTypeEnum::CAUGHT, PlayerIds::STRIKER, extra: [
                'runs' => 6,
                'runs_off_bat' => 6,
                'fielder_id' => PlayerIds::FIELDER,
            ]),
        ]);

        $stats = $this->compute($balls);

        $this->assertSame(26, $stats['total_runs']);
        $this->assertSame(26, $stats['fall_of_wickets'][0]['score']);
        $this->assertSame('1.0', $stats['fall_of_wickets'][0]['overs']);
    }

    /**
     * Extra delivery after over complete: NB should not add to legal ball count.
     */
    public function test_five_legal_plus_no_ball_plus_dot_in_new_over(): void
    {
        $balls = BallFactory::withPositions([
            ...array_fill(0, 6, BallFactory::dot()),
            BallFactory::noBall(),
            BallFactory::dot(),
        ]);

        $stats = $this->compute($balls);

        $this->assertSame(7, $stats['legal_balls']);
        $details = InningsStatsService::currentOverDetails(BallFactory::collection($balls));
        $this->assertSame(1, $details['over_number']);
        $this->assertSame(1, $details['balls_in_current_over']);
    }

    /**
     * Striker swap via pending crease when both pending IDs match on-crease pair.
     */
    public function test_pending_crease_end_swap(): void
    {
        $crease = InningsStatsService::applyPendingCreaseSelection(
            PlayerIds::STRIKER,
            PlayerIds::NON_STRIKER,
            [
                'next_batter_id' => PlayerIds::NON_STRIKER,
                'next_non_striker_id' => PlayerIds::STRIKER,
            ],
            true,
            [],
        );

        $this->assertSame(PlayerIds::NON_STRIKER, $crease['striker_id']);
        $this->assertSame(PlayerIds::STRIKER, $crease['non_striker_id']);
    }

    /**
     * Incoming batter after wicket fills vacant striker slot via pending.
     */
    public function test_pending_incoming_batter_fills_striker_slot(): void
    {
        $crease = InningsStatsService::applyPendingCreaseSelection(
            null,
            PlayerIds::NON_STRIKER,
            ['next_batter_id' => PlayerIds::INCOMING],
            true,
            [],
        );

        $this->assertSame(PlayerIds::INCOMING, $crease['striker_id']);
        $this->assertSame(PlayerIds::NON_STRIKER, $crease['non_striker_id']);
    }

    /**
     * Dismissed player must not re-enter via pending crease.
     */
    public function test_pending_skips_dismissed_player_id(): void
    {
        $crease = InningsStatsService::applyPendingCreaseSelection(
            null,
            PlayerIds::NON_STRIKER,
            ['next_batter_id' => PlayerIds::STRIKER],
            true,
            [PlayerIds::STRIKER],
        );

        $this->assertNull($crease['striker_id']);
    }

    /**
     * Run rate with partial over.
     */
    public function test_run_rate_partial_over(): void
    {
        $this->assertSame('12.00', InningsStatsService::runRate(12, 6));
        $this->assertSame('24.00', InningsStatsService::runRate(12, 3));
    }

    /**
     * @return array<string, array{0: int, 1: int, 2: int}>
     */
    public static function oddEvenRotationMatrixProvider(): array
    {
        $cases = [];
        foreach ([0, 1, 2, 3, 4, 5, 6] as $runs) {
            $cases["legal_{$runs}"] = [$runs, false, false];
            $cases["no_ball_{$runs}"] = [$runs, true, false];
            $cases["bye_{$runs}"] = [$runs, false, true];
        }

        return $cases;
    }

    #[DataProvider('oddEvenRotationMatrixProvider')]
    public function test_odd_even_rotation_matrix(int $runs, bool $noBall, bool $bye): void
    {
        if ($noBall && $bye) {
            $ball = BallFactory::noBallBye($runs);
        } elseif ($noBall) {
            $ball = BallFactory::noBall($runs);
        } elseif ($bye) {
            $ball = BallFactory::bye($runs);
        } else {
            $ball = BallFactory::legal($runs);
        }

        $crease = $this->creaseAfter([$ball]);
        $shouldRotate = ($runs % 2) === 1;

        if ($shouldRotate) {
            $this->assertSame(PlayerIds::NON_STRIKER, $crease['striker_id']);
        } else {
            $this->assertSame(PlayerIds::STRIKER, $crease['striker_id']);
        }
    }

    /**
     * Wide rotation matrix: only runs beyond penalty count.
     *
     * @return array<string, array{0: int, 1: bool}>
     */
    public static function wideRotationMatrixProvider(): array
    {
        return [
            'wide 1 no rotate' => [1, false],
            'wide 2 rotate' => [2, true],
            'wide 3 no rotate' => [3, false],
            'wide 4 rotate' => [4, true],
            'wide 5 no rotate' => [5, false],
        ];
    }

    #[DataProvider('wideRotationMatrixProvider')]
    public function test_wide_rotation_matrix(int $totalRuns, bool $shouldRotate): void
    {
        $crease = $this->creaseAfter([BallFactory::wide($totalRuns)]);

        if ($shouldRotate) {
            $this->assertSame(PlayerIds::NON_STRIKER, $crease['striker_id']);
        } else {
            $this->assertSame(PlayerIds::STRIKER, $crease['striker_id']);
        }
    }
}
