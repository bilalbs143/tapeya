<?php

namespace Tests\Unit\Services\Broadcast;

use App\Models\Ball;
use App\Services\Broadcast\GraphicLiveStatsBuilder;
use App\Services\Broadcast\WinProbabilitySimilarSituationsService;
use App\Services\InningsStatsService;
use App\Services\PlayerStatsService;
use Illuminate\Support\Collection;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

class GraphicLiveStatsBuilderProjectedScoreTest extends TestCase
{
    public function test_projected_score_is_null_for_second_innings(): void
    {
        $this->assertNull($this->invokeProjectedScore(2, 36, 6, collect($this->sixLegalBalls(eachRuns: 6)), 20));
    }

    public function test_projected_score_uses_recent_run_rate_and_remaining_overs(): void
    {
        $balls = collect($this->sixLegalBalls(eachRuns: 1));

        $projected = $this->invokeProjectedScore(1, 6, 6, $balls, 20);

        $this->assertSame(120, $projected);
    }

    public function test_projected_score_is_null_when_innings_complete(): void
    {
        $this->assertNull($this->invokeProjectedScore(1, 6, 120, collect($this->sixLegalBalls(eachRuns: 1)), 20));
    }

    /**
     * @return list<Ball>
     */
    private function sixLegalBalls(int $eachRuns, int $startOver = 0): array
    {
        $balls = [];
        for ($ballInOver = 1; $ballInOver <= 6; $ballInOver++) {
            $balls[] = $this->ball($startOver, $ballInOver, $eachRuns, $eachRuns);
        }

        return $balls;
    }

    /**
     * @param  Collection<int, Ball>  $balls
     */
    private function invokeProjectedScore(
        int $inningsNumber,
        int $totalRuns,
        int $legalBalls,
        Collection $balls,
        int $matchOvers,
    ): ?int {
        $builder = new GraphicLiveStatsBuilder(
            new PlayerStatsService,
            new InningsStatsService,
            new WinProbabilitySimilarSituationsService,
        );

        $method = new ReflectionMethod(GraphicLiveStatsBuilder::class, 'projectedScore');
        $method->setAccessible(true);

        /** @var int|null */
        return $method->invoke($builder, $inningsNumber, $totalRuns, $legalBalls, $balls, $matchOvers);
    }

    private function ball(
        int $over,
        int $ballInOver,
        int $runs,
        int $runsOffBat = 0,
    ): Ball {
        return new Ball([
            'over_number' => $over,
            'ball_in_over' => $ballInOver,
            'runs' => $runs,
            'runs_off_bat' => $runsOffBat,
            'is_legal' => true,
            'is_wide' => false,
            'is_no_ball' => false,
            'is_wicket' => false,
        ]);
    }
}
