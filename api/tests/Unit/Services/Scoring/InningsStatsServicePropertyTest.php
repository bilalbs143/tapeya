<?php

namespace Tests\Unit\Services\Scoring;

use App\Services\InningsStatsService;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\Scoring\PlayerIds;
use Tests\Support\Scoring\ScoringPropertyGenerator;

/**
 * Property-style tests: random innings must always satisfy core invariants.
 */
class InningsStatsServicePropertyTest extends ScoringUnitTestCase
{
    /**
     * @return array<string, array{0: int}>
     */
    public static function inningsSeedProvider(): array
    {
        return ScoringPropertyGenerator::seedProvider(250);
    }

    #[DataProvider('inningsSeedProvider')]
    public function test_random_innings_satisfy_core_invariants(int $seed): void
    {
        $balls = ScoringPropertyGenerator::buildInnings($seed);
        $stats = $this->compute($balls);

        $this->assertGreaterThanOrEqual(0, $stats['total_runs']);
        $this->assertGreaterThanOrEqual(0, $stats['total_wickets']);
        $this->assertGreaterThanOrEqual(0, $stats['legal_balls']);

        $extras = $stats['extras_breakdown'];
        $this->assertSame(
            (int) $extras['wides'] + (int) $extras['no_balls'] + (int) $extras['byes']
                + (int) $extras['leg_byes'] + (int) $extras['penalty_runs'],
            (int) $extras['total'],
        );

        $legalFromModel = collect($balls)->filter(fn ($b) => $b->isLegalDelivery())->count();
        $this->assertSame($legalFromModel, $stats['legal_balls']);
    }

    #[DataProvider('inningsSeedProvider')]
    public function test_random_innings_crease_ids_are_from_squad(int $seed): void
    {
        $balls = ScoringPropertyGenerator::buildInnings($seed);
        $crease = InningsStatsService::resolveCreaseAfterBalls(collect($balls));

        $known = [
            PlayerIds::STRIKER,
            PlayerIds::NON_STRIKER,
            PlayerIds::INCOMING,
            PlayerIds::FOURTH,
            null,
        ];

        $this->assertContains($crease['striker_id'], $known);
        $this->assertContains($crease['non_striker_id'], $known);

        if ($crease['striker_id'] && $crease['non_striker_id']) {
            $this->assertNotSame($crease['striker_id'], $crease['non_striker_id']);
        }
    }

    #[DataProvider('inningsSeedProvider')]
    public function test_random_innings_wicket_count_matches_non_retired_hurt(int $seed): void
    {
        $balls = ScoringPropertyGenerator::buildInnings($seed);
        $stats = $this->compute($balls);

        $expectedWickets = collect($balls)->filter(
            fn ($b) => $b->is_wicket && ! $b->isRetiredHurt(),
        )->count();

        $this->assertSame($expectedWickets, $stats['total_wickets']);
    }
}
