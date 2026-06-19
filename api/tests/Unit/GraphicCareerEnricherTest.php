<?php

namespace Tests\Unit;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Models\TournamentMatch;
use App\Services\Broadcast\GraphicCareerEnricher;
use App\Services\PlayerStatsService;
use PHPUnit\Framework\TestCase;

class GraphicCareerEnricherTest extends TestCase
{
    public function test_batsman_tournament_lt_omits_average(): void
    {
        $stats = $this->createMock(PlayerStatsService::class);
        $stats->method('battingForPlayerInTournament')->willReturn([
            'matches' => 6,
            'runs' => 198,
            'fours' => 4,
            'sixes' => 27,
            'fifties' => 0,
            'hundreds' => 1,
            'strike_rate' => 295.52,
            'average' => 49.5,
        ]);

        $match = new TournamentMatch(['tournament_id' => 42]);
        $enricher = new GraphicCareerEnricher($stats);

        $payload = $enricher->enrichForCommandKey(
            ['user_id' => 7],
            GraphicCommandKeyEnum::BATSMAN_TOURNAMENT_LT,
            $match,
        );

        $this->assertSame('Tournament Career', $payload['headline']);
        $this->assertArrayNotHasKey('average', $payload['tournament_batting']);
        $this->assertSame(198, $payload['tournament_batting']['runs']);
        $labels = array_column($payload['stats'], 'label');
        $this->assertNotContains('Avg', $labels);
    }

    public function test_batsman_tournament_fs_includes_average(): void
    {
        $stats = $this->createMock(PlayerStatsService::class);
        $stats->method('battingForPlayerInTournament')->willReturn([
            'matches' => 6,
            'runs' => 198,
            'fours' => 4,
            'sixes' => 27,
            'fifties' => 0,
            'hundreds' => 1,
            'strike_rate' => 295.52,
            'average' => 49.5,
        ]);

        $match = new TournamentMatch(['tournament_id' => 42]);
        $enricher = new GraphicCareerEnricher($stats);

        $payload = $enricher->enrichForCommandKey(
            ['user_id' => 7],
            GraphicCommandKeyEnum::BATSMAN_TOURNAMENT_FS,
            $match,
        );

        $this->assertSame(49.5, $payload['tournament_batting']['average']);
        $avgRow = array_values(array_filter($payload['stats'], fn ($row) => $row['label'] === 'Avg'))[0] ?? null;
        $this->assertNotNull($avgRow);
        $this->assertSame(49.5, $avgRow['value']);
    }

    public function test_bowler_tournament_uses_tournament_bowling_shape(): void
    {
        $stats = $this->createMock(PlayerStatsService::class);
        $stats->method('bowlingForPlayerInTournament')->willReturn([
            'matches' => 4,
            'overs' => 6.0,
            'runs_conceded' => 107,
            'wickets' => 1,
            'average' => 107.0,
            'economy' => 17.83,
        ]);

        $match = new TournamentMatch(['tournament_id' => 9]);
        $enricher = new GraphicCareerEnricher($stats);

        $payload = $enricher->enrichForCommandKey(
            ['user_id' => 3],
            GraphicCommandKeyEnum::BOWLER_TOURNAMENT_LT,
            $match,
        );

        $this->assertSame(107, $payload['tournament_bowling']['runs_conceded']);
        $this->assertSame(17.83, $payload['tournament_bowling']['economy']);
    }
}
