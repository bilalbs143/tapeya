<?php

namespace Tests\Feature\Scoring;

use App\Models\Ball;
use App\Models\User;
use App\Services\InningsStatsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Asserts that player avatar URLs flow through the live-stats broadcast pipeline.
 *
 * Scope: InningsStatsService::playersFromDatabase() — the single-query layer
 * that feeds both names and avatar URLs into GraphicLiveStatsBuilder.
 */
class PlayerAvatarInLiveContextTest extends TestCase
{
    use RefreshDatabase;

    public function test_players_from_database_returns_name_and_avatar_url_for_player_with_avatar(): void
    {
        Storage::fake(config('filesystems.media_disk', 'public'));

        $player = User::factory()->create([
            'name' => 'Zaheer Abbas',
            'avatar' => 'avatars/zaheer.jpg',
        ]);

        $balls = collect([
            $this->ballForPlayer($player->id),
        ]);

        $result = InningsStatsService::playersFromDatabase($balls);

        $this->assertArrayHasKey($player->id, $result);
        $this->assertSame('Zaheer Abbas', $result[$player->id]['name']);
        $this->assertNotNull($result[$player->id]['avatar_url']);
        $this->assertStringContainsString('zaheer.jpg', $result[$player->id]['avatar_url']);
    }

    public function test_players_from_database_returns_null_avatar_url_for_player_without_avatar(): void
    {
        $player = User::factory()->create([
            'name' => 'No Photo Player',
            'avatar' => null,
        ]);

        $balls = collect([
            $this->ballForPlayer($player->id),
        ]);

        $result = InningsStatsService::playersFromDatabase($balls);

        $this->assertArrayHasKey($player->id, $result);
        $this->assertNull($result[$player->id]['avatar_url']);
    }

    public function test_players_from_database_includes_extra_ids(): void
    {
        $pendingBatter = User::factory()->create(['name' => 'Pending Batter']);

        $result = InningsStatsService::playersFromDatabase(collect([]), [$pendingBatter->id]);

        $this->assertArrayHasKey($pendingBatter->id, $result);
        $this->assertSame('Pending Batter', $result[$pendingBatter->id]['name']);
    }

    public function test_players_from_database_covers_all_player_roles_on_a_ball(): void
    {
        $striker = User::factory()->create(['name' => 'Striker']);
        $nonStriker = User::factory()->create(['name' => 'Non Striker']);
        $bowler = User::factory()->create(['name' => 'Bowler']);

        $ball = $this->ballForPlayer($striker->id, $nonStriker->id, $bowler->id);

        $result = InningsStatsService::playersFromDatabase(collect([$ball]));

        $this->assertArrayHasKey($striker->id, $result);
        $this->assertArrayHasKey($nonStriker->id, $result);
        $this->assertArrayHasKey($bowler->id, $result);
    }

    public function test_names_from_database_is_a_compatible_wrapper(): void
    {
        $player = User::factory()->create(['name' => 'Inzamam Ul Haq']);
        $balls = collect([$this->ballForPlayer($player->id)]);

        $names = InningsStatsService::namesFromDatabase($balls);

        $this->assertSame('Inzamam Ul Haq', $names[$player->id]);
    }

    private function ballForPlayer(int $strikerId, ?int $nonStrikerId = null, ?int $bowlerId = null): Ball
    {
        return new Ball([
            'striker_id' => $strikerId,
            'non_striker_id' => $nonStrikerId,
            'bowler_id' => $bowlerId,
            'out_player_id' => null,
            'fielder_id' => null,
            'over' => 0,
            'ball_in_over' => 1,
            'runs' => 1,
            'runs_off_bat' => 1,
            'is_wide' => false,
            'is_no_ball' => false,
            'is_bye' => false,
            'is_leg_bye' => false,
            'is_wicket' => false,
            'is_free_hit' => false,
            'dont_count_ball' => false,
            'additional_runs' => 0,
            'penalty_runs' => 0,
        ]);
    }
}
