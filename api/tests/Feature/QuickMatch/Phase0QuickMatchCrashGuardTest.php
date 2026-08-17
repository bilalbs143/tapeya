<?php

namespace Tests\Feature\QuickMatch;

use App\Enums\Event\MatchKindEnum;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\QuickMatch\CreatesQuickMatch;
use Tests\TestCase;

class Phase0QuickMatchCrashGuardTest extends TestCase
{
    use CreatesQuickMatch;
    use RefreshDatabase;

    public function test_get_match_returns_200_with_null_tournament_for_quick_match(): void
    {
        $owner = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $match = $this->createQuickMatch($owner);
        $match->load('tournament');

        $this->assertNull($match->tournamentSummary());

        $this->actingAs($owner, 'api')
            ->getJson("/api/v1/matches/{$match->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $match->id)
            ->assertJsonPath('data.kind', MatchKindEnum::QUICK->value)
            ->assertJsonPath('data.tournament', null)
            ->assertJsonPath('data.venue_name', null)
            ->assertJsonPath('data.can_operate', true)
            ->assertJsonPath('data.created_by', $owner->id)
            ->assertJsonPath('data.cricket_format', 'tape_ball');
    }

    public function test_stranger_get_match_does_not_fatal_and_cannot_operate(): void
    {
        $owner = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $stranger = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $match = $this->createQuickMatch($owner);

        $this->actingAs($stranger, 'api')
            ->getJson("/api/v1/matches/{$match->id}")
            ->assertOk()
            ->assertJsonPath('data.tournament', null)
            ->assertJsonPath('data.can_operate', false);
    }

    public function test_admin_can_operate_quick_match(): void
    {
        $owner = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $admin = User::factory()->create(['type' => 'administrator', 'status' => 'active']);
        $match = $this->createQuickMatch($owner);

        $this->actingAs($admin, 'api')
            ->getJson("/api/v1/matches/{$match->id}")
            ->assertOk()
            ->assertJsonPath('data.can_operate', true);
    }

    public function test_tournament_match_create_still_requires_venue_name(): void
    {
        $organizer = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $tournament = Tournament::create([
            'organizer_id' => $organizer->id,
            'created_by' => $organizer->id,
            'tournament_name' => 'Venue Cup',
            'tournament_type' => 'league',
            'cricket_format' => 'tape_ball',
            'venue_name' => 'Main Ground',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'number_of_teams' => 2,
            'city' => 'Lahore',
            'match_timings' => 'day',
        ]);

        $this->actingAs($organizer, 'api')
            ->postJson("/api/v1/tournaments/{$tournament->id}/matches", [
                'home_team_id' => 1,
                'away_team_id' => 2,
                'match_date' => now()->toDateString(),
                'match_time' => '10:00',
                'players_per_side' => 11,
                'overs' => 20,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['venue_name']);
    }
}
