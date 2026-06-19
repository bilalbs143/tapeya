<?php

namespace Tests\Unit\Services\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use App\Services\InningsStatsService;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\Scoring\BallFactory;
use Tests\Support\Scoring\PlayerIds;

/**
 * Wicket crease resolution — especially run-out crossing and incoming batters.
 *
 * Crease resolution uses the *next* ball's stored striker/non-striker to identify
 * the incoming batter, so two-ball sequences are required for full resolution tests.
 */
class InningsStatsServiceWicketsTest extends ScoringUnitTestCase
{
    /**
     * Bowled: striker out, incoming batter faces from striker's end.
     */
    public function test_bowled_incoming_batter_faces(): void
    {
        $balls = [
            BallFactory::wicket(DismissalTypeEnum::BOWLED, PlayerIds::STRIKER),
            BallFactory::legal(0, PlayerIds::INCOMING, PlayerIds::NON_STRIKER),
        ];

        $crease = $this->creaseAfter($balls);

        $this->assertSame(PlayerIds::INCOMING, $crease['striker_id']);
        $this->assertSame(PlayerIds::NON_STRIKER, $crease['non_striker_id']);
    }

    /**
     * Mankad: non-striker out, striker continues to face.
     */
    public function test_mankad_striker_continues(): void
    {
        $balls = [
            BallFactory::wicket(DismissalTypeEnum::MANKAD, PlayerIds::NON_STRIKER),
            BallFactory::legal(0, PlayerIds::STRIKER, PlayerIds::INCOMING),
        ];

        $crease = $this->creaseAfter($balls);

        $this->assertSame(PlayerIds::STRIKER, $crease['striker_id']);
        $this->assertSame(PlayerIds::INCOMING, $crease['non_striker_id']);
    }

    /**
     * @return array<string, array{0: int, 1: int}>
     */
    public static function runOutNotCrossedProvider(): array
    {
        return [
            'striker run out not crossed' => [PlayerIds::STRIKER, PlayerIds::INCOMING],
            'non-striker run out not crossed' => [PlayerIds::NON_STRIKER, PlayerIds::STRIKER],
        ];
    }

    #[DataProvider('runOutNotCrossedProvider')]
    public function test_run_out_not_crossed_crease(int $outPlayer, int $expectedStriker): void
    {
        $survivor = $outPlayer === PlayerIds::STRIKER ? PlayerIds::NON_STRIKER : PlayerIds::STRIKER;
        $incoming = PlayerIds::INCOMING;

        $balls = [
            BallFactory::runOut($outPlayer, crossed: false, runsBeforeDismissal: 0),
            BallFactory::legal(
                0,
                $outPlayer === PlayerIds::STRIKER ? $incoming : $survivor,
                $outPlayer === PlayerIds::STRIKER ? $survivor : $incoming,
            ),
        ];

        $crease = $this->creaseAfter($balls);

        $this->assertSame($expectedStriker, $crease['striker_id']);
    }

    public function test_run_out_crossed_striker_out_survivor_faces(): void
    {
        $balls = [
            BallFactory::runOut(PlayerIds::STRIKER, crossed: true, runsBeforeDismissal: 0),
            BallFactory::legal(0, PlayerIds::NON_STRIKER, PlayerIds::INCOMING),
        ];

        $crease = $this->creaseAfter($balls);

        $this->assertSame(PlayerIds::NON_STRIKER, $crease['striker_id']);
        $this->assertSame(PlayerIds::INCOMING, $crease['non_striker_id']);
    }

    public function test_run_out_crossed_non_striker_out_incoming_faces(): void
    {
        $balls = [
            BallFactory::runOut(PlayerIds::NON_STRIKER, crossed: true, runsBeforeDismissal: 0),
            BallFactory::legal(0, PlayerIds::INCOMING, PlayerIds::STRIKER),
        ];

        $crease = $this->creaseAfter($balls);

        $this->assertSame(PlayerIds::INCOMING, $crease['striker_id']);
        $this->assertSame(PlayerIds::STRIKER, $crease['non_striker_id']);
    }

    /**
     * Wicket on wide — only run-out/stumped valid; runs on wide count toward total.
     */
    public function test_wicket_on_wide_with_runs_included_in_total(): void
    {
        $stats = $this->compute([
            BallFactory::runOut(PlayerIds::STRIKER, crossed: false, runsBeforeDismissal: 2, onWide: true),
        ]);

        $this->assertSame(3, $stats['total_runs']);
        $this->assertSame(1, $stats['total_wickets']);
    }

    public function test_wicket_on_no_ball_without_runs(): void
    {
        $stats = $this->compute([
            BallFactory::runOut(PlayerIds::STRIKER, crossed: false, runsBeforeDismissal: 0, onNoBall: true),
        ]);

        $this->assertSame(1, $stats['total_runs']);
        $this->assertSame(1, $stats['total_wickets']);
    }

    public function test_multiple_wickets_build_fow_sequence(): void
    {
        $stats = $this->compute([
            BallFactory::legal(10),
            BallFactory::wicket(DismissalTypeEnum::CAUGHT, PlayerIds::STRIKER, extra: ['fielder_id' => PlayerIds::FIELDER]),
            BallFactory::legal(5),
            BallFactory::wicket(DismissalTypeEnum::BOWLED, PlayerIds::INCOMING),
        ]);

        $this->assertCount(2, $stats['fall_of_wickets']);
        $this->assertSame(10, $stats['fall_of_wickets'][0]['score']);
        $this->assertSame(15, $stats['fall_of_wickets'][1]['score']);
    }

    public function test_is_free_hit_after_no_ball(): void
    {
        $this->assertTrue(InningsStatsService::isFreeHitDelivery(BallFactory::noBall()));
    }

    public function test_is_free_hit_after_free_hit_wide(): void
    {
        $this->assertTrue(InningsStatsService::isFreeHitDelivery(
            BallFactory::make(['is_free_hit' => true, 'is_wide' => true, 'runs' => 1]),
        ));
    }

    public function test_is_not_free_hit_after_legal_delivery(): void
    {
        $this->assertFalse(InningsStatsService::isFreeHitDelivery(BallFactory::legal(1)));
    }

    public function test_next_is_free_hit_in_over_details(): void
    {
        $details = InningsStatsService::currentOverDetails(
            BallFactory::collection([BallFactory::noBall()]),
        );

        $this->assertTrue($details['next_is_free_hit']);
    }
}
