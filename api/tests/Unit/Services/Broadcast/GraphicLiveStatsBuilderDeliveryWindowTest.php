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

class GraphicLiveStatsBuilderDeliveryWindowTest extends TestCase
{
    public function test_last_delivery_window_includes_illegal_deliveries_such_as_wides(): void
    {
        $balls = collect([
            $this->ball(over: 0, ballInOver: 1, runs: 4, runsOffBat: 4),
            $this->ball(over: 0, ballInOver: 2, runs: 1, runsOffBat: 1),
            $this->ball(over: 0, ballInOver: 3, runs: 6, runsOffBat: 6),
            $this->ball(over: 0, ballInOver: 4, runs: 2, runsOffBat: 2),
            $this->ball(over: 0, ballInOver: 5, runs: 1, isWide: true),
            $this->ball(over: 0, ballInOver: 6, runs: 0),
            $this->ball(over: 0, ballInOver: 7, runs: 6, runsOffBat: 6),
        ]);

        $result = $this->invokeDeliveryWindow($balls, 12);

        $this->assertCount(7, $result['deliveries']);
        $this->assertSame('WD', $result['deliveries'][4]['display_token']);
        $this->assertFalse($result['deliveries'][4]['is_legal']);
        $this->assertSame(20, $result['runs']);
    }

    public function test_delivery_window_caps_at_requested_count_from_tail(): void
    {
        $balls = collect(range(1, 15))->map(
            fn (int $i) => $this->ball(over: 0, ballInOver: $i, runs: 1, runsOffBat: 1),
        );

        $result = $this->invokeDeliveryWindow($balls, 12);

        $this->assertCount(12, $result['deliveries']);
        $this->assertSame(12, $result['runs']);
    }

    public function test_delivery_window_includes_no_balls(): void
    {
        $balls = collect([
            $this->ball(over: 1, ballInOver: 1, runs: 0),
            $this->ball(over: 1, ballInOver: 2, runs: 1, isNoBall: true),
            $this->ball(over: 1, ballInOver: 3, runs: 1, runsOffBat: 1),
        ]);

        $result = $this->invokeDeliveryWindow($balls, 12);

        $this->assertCount(3, $result['deliveries']);
        $this->assertSame('NB', $result['deliveries'][1]['display_token']);
        $this->assertFalse($result['deliveries'][1]['is_legal']);
        $this->assertSame(2, $result['runs']);
    }

    /**
     * @param  Collection<int, Ball>  $balls
     * @return array{dots:int, fours:int, sixes:int, wickets:int, runs:int, deliveries:list<array<string, mixed>>}
     */
    private function invokeDeliveryWindow(Collection $balls, int $count): array
    {
        $builder = new GraphicLiveStatsBuilder(
            new PlayerStatsService,
            new InningsStatsService,
            new WinProbabilitySimilarSituationsService,
        );

        $method = new ReflectionMethod(GraphicLiveStatsBuilder::class, 'buildDeliveryWindow');
        $method->setAccessible(true);

        /** @var array{dots:int, fours:int, sixes:int, wickets:int, runs:int, deliveries:list<array<string, mixed>>} */
        return $method->invoke($builder, $balls, $count);
    }

    private function ball(
        int $over,
        int $ballInOver,
        int $runs,
        int $runsOffBat = 0,
        bool $isWide = false,
        bool $isNoBall = false,
    ): Ball {
        return new Ball([
            'over' => $over,
            'ball_in_over' => $ballInOver,
            'runs' => $runs,
            'runs_off_bat' => $runsOffBat,
            'is_wide' => $isWide,
            'is_no_ball' => $isNoBall,
            'is_bye' => false,
            'is_leg_bye' => false,
            'is_wicket' => false,
            'is_free_hit' => false,
            'dont_count_ball' => false,
        ]);
    }
}
