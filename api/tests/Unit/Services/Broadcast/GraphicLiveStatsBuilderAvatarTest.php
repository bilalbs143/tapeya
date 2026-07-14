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

class GraphicLiveStatsBuilderAvatarTest extends TestCase
{
    public function test_graphic_strip_includes_avatar_url_on_batters_and_bowler(): void
    {
        $balls = collect([
            $this->ball(strikerId: 10, nonStrikerId: 11, bowlerId: 20, over: 0, ballInOver: 1, runs: 1, runsOffBat: 1),
        ]);

        $playerPhotos = [
            10 => 'https://cdn.example/striker.jpg',
            11 => 'https://cdn.example/non-striker.jpg',
            20 => 'https://cdn.example/bowler.jpg',
        ];

        $strip = $this->invokeStrip($balls, $playerPhotos);

        $this->assertSame('https://cdn.example/striker.jpg', $strip['batters'][0]['avatar_url'] ?? null);
        $this->assertSame('https://cdn.example/non-striker.jpg', $strip['batters'][1]['avatar_url'] ?? null);
        $this->assertSame('https://cdn.example/bowler.jpg', $strip['bowler']['avatar_url'] ?? null);
    }

    public function test_map_partnership_history_includes_batter_avatar_urls(): void
    {
        $builder = new GraphicLiveStatsBuilder(
            new PlayerStatsService,
            new InningsStatsService,
            new WinProbabilitySimilarSituationsService,
        );

        $method = new ReflectionMethod(GraphicLiveStatsBuilder::class, 'mapPartnershipHistory');
        $method->setAccessible(true);

        $playerNames = [10 => 'Waqar Salam', 11 => 'Khushdil Shah'];
        $playerPhotos = [
            10 => 'https://cdn.example/waqar.jpg',
            11 => 'https://cdn.example/khushdil.jpg',
        ];

        /** @var list<array<string, mixed>> $history */
        $history = $method->invoke($builder, [[
            'wicket_number' => 1,
            'player_1_id' => 10,
            'player_2_id' => 11,
            'player_1_runs' => 34,
            'player_2_runs' => 21,
            'player_1_balls' => 28,
            'player_2_balls' => 19,
            'runs' => 55,
            'balls' => 47,
        ]], $playerNames, $playerPhotos);

        $this->assertSame('https://cdn.example/waqar.jpg', $history[0]['batter1_avatar_url'] ?? null);
        $this->assertSame('https://cdn.example/khushdil.jpg', $history[0]['batter2_avatar_url'] ?? null);
        $this->assertSame('Waqar Salam', $history[0]['batter1_display_name'] ?? null);
        $this->assertSame('Khushdil Shah', $history[0]['batter2_display_name'] ?? null);
    }

    public function test_map_batting_order_keeps_full_display_names(): void
    {
        $builder = new GraphicLiveStatsBuilder(
            new PlayerStatsService,
            new InningsStatsService,
            new WinProbabilitySimilarSituationsService,
        );

        $method = new ReflectionMethod(GraphicLiveStatsBuilder::class, 'mapBattingOrder');
        $method->setAccessible(true);

        /** @var list<array<string, mixed>> $order */
        $order = $method->invoke($builder, [[
            'id' => 10,
            'name' => 'Muhammad Bilal',
            'runs' => 42,
            'balls' => 28,
            'is_on_crease' => true,
            'dismissal_type' => null,
        ]]);

        $this->assertSame('Muhammad Bilal', $order[0]['display_name'] ?? null);
    }

    /**
     * @param  Collection<int, Ball>  $balls
     * @param  array<int, string|null>  $playerPhotos
     * @return array<string, mixed>
     */
    private function invokeStrip(Collection $balls, array $playerPhotos = []): array
    {
        $stats = (new InningsStatsService)->compute($balls, [
            10 => 'Striker',
            11 => 'Non Striker',
            20 => 'Bowler',
        ]);

        $builder = new GraphicLiveStatsBuilder(
            new PlayerStatsService,
            new InningsStatsService,
            new WinProbabilitySimilarSituationsService,
        );

        $method = new ReflectionMethod(GraphicLiveStatsBuilder::class, 'graphicOverBattersBowlerStrip');
        $method->setAccessible(true);

        /** @var array<string, mixed> */
        return $method->invoke(
            $builder,
            $balls,
            $stats,
            [
                10 => 'Striker',
                11 => 'Non Striker',
                20 => 'Bowler',
            ],
            [],
            null,
            null,
            $playerPhotos,
        );
    }

    private function ball(
        int $strikerId,
        int $nonStrikerId,
        int $bowlerId,
        int $over,
        int $ballInOver,
        int $runs,
        int $runsOffBat = 0,
    ): Ball {
        return new Ball([
            'striker_id' => $strikerId,
            'non_striker_id' => $nonStrikerId,
            'bowler_id' => $bowlerId,
            'over' => $over,
            'ball_in_over' => $ballInOver,
            'runs' => $runs,
            'runs_off_bat' => $runsOffBat,
            'is_wide' => false,
            'is_no_ball' => false,
            'is_bye' => false,
            'is_leg_bye' => false,
            'is_wicket' => false,
            'is_free_hit' => false,
            'dont_count_ball' => false,
        ]);
    }
}
