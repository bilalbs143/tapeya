<?php

namespace Tests\Feature\LiveScore;

use App\Enums\Event\InningsStatusEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Models\User;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\TestCase;

class LiveScoreFeedTest extends TestCase
{
    use BuildsScoringMatch;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SystemSettingsSeeder::class);
        $this->setUpScoringMatch(overs: 20, playersPerSide: 11);
        $this->scoringMatch->tournament->update([
            'tournament_type' => TournamentTypeEnum::OPEN_TOURNAMENT->value,
            'short_name' => 'WPL',
        ]);
    }

    public function test_requires_authentication(): void
    {
        $this->getJson('/api/v1/live/scores')->assertUnauthorized();
    }

    public function test_returns_empty_when_no_live_open_tournament_matches(): void
    {
        $this->scoringMatch->update(['status' => MatchStatusEnum::SCHEDULED->value]);

        $user = User::factory()->create();

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/live/scores')
            ->assertOk()
            ->assertJsonPath('data', []);
    }

    public function test_excludes_non_open_tournament_matches(): void
    {
        $this->scoringMatch->tournament->update([
            'tournament_type' => TournamentTypeEnum::LEAGUE->value,
        ]);

        $user = User::factory()->create();

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/live/scores')
            ->assertOk()
            ->assertJsonPath('data', []);
    }

    public function test_includes_in_progress_open_tournament_match_with_scores(): void
    {
        $this->recordSequence($this->innings1, [
            ['runs' => 4, 'runs_off_bat' => 4],
            ['runs' => 1, 'runs_off_bat' => 1],
            ['runs' => 0, 'runs_off_bat' => 0, 'is_wicket' => true, 'out_player_id' => $this->player(0)->id, 'dismissal_type' => 'bowled'],
            ['runs' => 6, 'runs_off_bat' => 6],
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/live/scores')
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
        $row = $response->json('data.0');

        $this->assertSame($this->scoringMatch->id, $row['id']);
        $this->assertSame($this->scoringMatch->tournament_id, $row['tournament_id']);
        $this->assertSame('in_progress', $row['status']);
        $this->assertSame('WPL', $row['match_label']);
        $this->assertSame(20, $row['overs_limit']);
        $this->assertSame('Team A', $row['home_team']['name']);
        $this->assertSame('Team B', $row['away_team']['name']);
        $this->assertSame(11, $row['active_innings']['total_runs']);
        $this->assertSame(1, $row['active_innings']['total_wickets']);
        $this->assertSame(4, $row['active_innings']['legal_balls']);
        $this->assertSame('0.4', $row['active_innings']['overs_display']);
        $this->assertSame('16.50', $row['active_innings']['current_run_rate']);
        $this->assertSame('Current run rate: 16.50.', $row['commentary']);
    }

    public function test_second_innings_includes_target_and_chase_commentary(): void
    {
        $this->innings1->update(['status' => InningsStatusEnum::COMPLETED->value]);
        $this->innings2->update(['status' => InningsStatusEnum::IN_PROGRESS->value]);

        // First innings: 10 runs in one legal ball (completed).
        $this->recordSequence($this->innings1, [
            ['runs' => 4, 'runs_off_bat' => 4],
            ['runs' => 6, 'runs_off_bat' => 6],
        ]);

        // Second innings: 3 runs in one legal ball.
        $this->recordSequence($this->innings2, [
            [
                'runs' => 3,
                'runs_off_bat' => 3,
                'striker_id' => $this->player(2)->id,
                'non_striker_id' => $this->player(3)->id,
                'bowler_id' => $this->player(0)->id,
            ],
        ]);

        $user = User::factory()->create();

        $row = $this->actingAs($user, 'api')
            ->getJson('/api/v1/live/scores')
            ->assertOk()
            ->json('data.0');

        $this->assertSame(2, $row['active_innings']['innings_number']);
        $this->assertSame(11, $row['active_innings']['target']);
        $this->assertSame(8, $row['active_innings']['runs_to_win']);
        $this->assertSame(119, $row['active_innings']['balls_remaining']);
        $this->assertSame('Team B need 8 runs from 119 balls.', $row['commentary']);

        $completed = collect($row['innings'])->firstWhere('innings_number', 1);
        $this->assertSame(10, $completed['total_runs']);
        $this->assertSame('completed', $completed['innings_status']);
    }

    public function test_returns_multiple_live_matches(): void
    {
        $second = $this->scoringMatch->replicate(['id']);
        $second->venue_name = 'Ground B';
        $second->save();

        $user = User::factory()->create();

        $ids = collect(
            $this->actingAs($user, 'api')
                ->getJson('/api/v1/live/scores')
                ->assertOk()
                ->json('data'),
        )->pluck('id');

        $this->assertTrue($ids->contains($this->scoringMatch->id));
        $this->assertTrue($ids->contains($second->id));
        $this->assertCount(2, $ids);
    }

    public function test_excludes_in_progress_matches_stale_over_one_day(): void
    {
        $this->scoringMatch->forceFill([
            'updated_at' => now()->subDay()->subMinute(),
        ])->saveQuietly();

        $user = User::factory()->create();

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/live/scores')
            ->assertOk()
            ->assertJsonPath('data', []);
    }
}
