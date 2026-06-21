<?php

namespace Tests\Unit\Services\Scoring;

use App\Models\Ball;
use App\Services\InningsStatsService;
use PHPUnit\Framework\TestCase;
use Tests\Support\Scoring\BallFactory;
use Tests\Support\Scoring\PlayerIds;

/**
 * Base class for pure scoring unit tests (no Laravel bootstrap).
 */
abstract class ScoringUnitTestCase extends TestCase
{
    protected InningsStatsService $statsService;

    protected function setUp(): void
    {
        parent::setUp();
        BallFactory::resetIds();
        $this->statsService = new InningsStatsService;
    }

    /**
     * @param  list<Ball>  $balls
     * @return array<string, mixed>
     */
    protected function compute(array $balls): array
    {
        return $this->statsService->compute(
            BallFactory::collection($balls),
            PlayerIds::names(),
        );
    }

    /**
     * @param  list<Ball>  $balls
     * @return array{striker_id: int|null, non_striker_id: int|null}
     */
    protected function creaseAfter(array $balls): array
    {
        return InningsStatsService::resolveCreaseAfterBalls(BallFactory::collection($balls));
    }
}
