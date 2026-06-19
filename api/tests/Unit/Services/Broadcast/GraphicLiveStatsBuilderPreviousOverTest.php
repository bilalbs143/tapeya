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

class GraphicLiveStatsBuilderPreviousOverTest extends TestCase
{
    public function test_previous_over_includes_wicket_count_from_completed_over(): void
    {
        $balls = collect([
            $this->ball(over: 0, ballInOver: 1, runs: 1, runsOffBat: 1),
            $this->ball(over: 0, ballInOver: 2, runs: 4, runsOffBat: 4),
            $this->ball(over: 0, ballInOver: 3, runs: 0, isWicket: true),
            $this->ball(over: 0, ballInOver: 4, runs: 1, runsOffBat: 1),
            $this->ball(over: 0, ballInOver: 5, runs: 0),
            $this->ball(over: 0, ballInOver: 6, runs: 2, runsOffBat: 2),
            $this->ball(over: 1, ballInOver: 1, runs: 0),
        ]);

        $strip = $this->invokeStrip($balls);

        $this->assertSame(8, $strip['previous_over_runs']);
        $this->assertSame(1, $strip['previous_over_wickets']);
    }

    public function test_previous_over_wickets_default_to_zero_when_no_wickets_fall(): void
    {
        $balls = collect([
            $this->ball(over: 0, ballInOver: 1, runs: 1, runsOffBat: 1),
            $this->ball(over: 0, ballInOver: 2, runs: 1, runsOffBat: 1),
            $this->ball(over: 0, ballInOver: 3, runs: 1, runsOffBat: 1),
            $this->ball(over: 0, ballInOver: 4, runs: 1, runsOffBat: 1),
            $this->ball(over: 0, ballInOver: 5, runs: 1, runsOffBat: 1),
            $this->ball(over: 0, ballInOver: 6, runs: 1, runsOffBat: 1),
            $this->ball(over: 1, ballInOver: 1, runs: 0),
        ]);

        $strip = $this->invokeStrip($balls);

        $this->assertSame(6, $strip['previous_over_runs']);
        $this->assertSame(0, $strip['previous_over_wickets']);
    }

    /**
     * @param  Collection<int, Ball>  $balls
     * @return array<string, mixed>
     */
    private function invokeStrip(Collection $balls): array
    {
        $stats = (new InningsStatsService)->compute($balls, []);

        $builder = new GraphicLiveStatsBuilder(
            new PlayerStatsService,
            new InningsStatsService,
            new WinProbabilitySimilarSituationsService,
        );

        $method = new ReflectionMethod(GraphicLiveStatsBuilder::class, 'graphicOverBattersBowlerStrip');
        $method->setAccessible(true);

        /** @var array<string, mixed> */
        return $method->invoke($builder, $balls, $stats, [], [], null, null);
    }

    private function ball(
        int $over,
        int $ballInOver,
        int $runs,
        int $runsOffBat = 0,
        bool $isWicket = false,
    ): Ball {
        return new Ball([
            'over' => $over,
            'ball_in_over' => $ballInOver,
            'runs' => $runs,
            'runs_off_bat' => $runsOffBat,
            'is_wide' => false,
            'is_no_ball' => false,
            'is_bye' => false,
            'is_leg_bye' => false,
            'is_wicket' => $isWicket,
            'is_free_hit' => false,
            'dont_count_ball' => false,
        ]);
    }
}
