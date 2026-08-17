<?php

namespace Tests\Feature\QuickMatch;

use App\Models\PlayerMatchBowling;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\Support\QuickMatch\CreatesQuickMatch;
use Tests\TestCase;

class RecentMatchesTest extends TestCase
{
    use CreatesQuickMatch;
    use RefreshDatabase;

    public function test_recent_matches_includes_bowling_only_appearance(): void
    {
        $owner = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $bowler = User::factory()->create(['type' => 'user', 'status' => 'active', 'phone' => '+923008887701']);
        $match = $this->createQuickMatch($owner);

        DB::table('match_squads')->insert([
            'match_id' => $match->id,
            'team_id' => $match->away_team_id,
            'user_id' => $bowler->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        PlayerMatchBowling::query()->create([
            'player_id' => $bowler->id,
            'match_id' => $match->id,
            'matches' => 1,
            'innings' => 1,
            'overs' => 0.1,
            'maidens' => 0,
            'runs_conceded' => 4,
            'wickets' => 0,
            'wides' => 0,
            'no_balls' => 0,
            'economy' => 24.0,
            'average' => 0,
            'strike_rate' => 0,
        ]);

        $this->actingAs($bowler, 'api')
            ->getJson("/api/v1/users/{$bowler->id}/recent-matches")
            ->assertOk()
            ->assertJsonFragment(['match_id' => $match->id, 'kind' => 'quick']);
    }
}
