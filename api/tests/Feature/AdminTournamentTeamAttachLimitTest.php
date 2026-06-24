<?php

namespace Tests\Feature;

use App\Enums\User\UserTypeEnum;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTournamentTeamAttachLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_attach_teams_beyond_tournament_limit(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $tournament = Tournament::create([
            'organizer_id' => $admin->id,
            'tournament_name' => 'Limited Cup',
            'tournament_type' => 'league',
            'cricket_format' => 'tape_ball',
            'venue_name' => 'Test Ground',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'number_of_teams' => 2,
            'city' => 'Test City',
            'match_timings' => 'day',
        ]);

        $teamA = Team::create([
            'name' => 'Team A',
            'code' => 'TMA',
            'country' => 'PK',
            'city' => 'Lahore',
            'user_id' => $admin->id,
        ]);
        $teamB = Team::create([
            'name' => 'Team B',
            'code' => 'TMB',
            'country' => 'PK',
            'city' => 'Karachi',
            'user_id' => $admin->id,
        ]);
        $teamC = Team::create([
            'name' => 'Team C',
            'code' => 'TMC',
            'country' => 'PK',
            'city' => 'Islamabad',
            'user_id' => $admin->id,
        ]);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/tournaments/{$tournament->id}/teams", [
                'team_ids' => [$teamA->id, $teamB->id],
            ])
            ->assertOk();

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/tournaments/{$tournament->id}/teams", [
                'team_ids' => [$teamC->id],
            ])
            ->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'This tournament already has the maximum number of teams (2).',
            ]);
    }

    public function test_admin_cannot_attach_team_already_on_tournament(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $tournament = Tournament::create([
            'organizer_id' => $admin->id,
            'tournament_name' => 'Dup Cup',
            'tournament_type' => 'league',
            'cricket_format' => 'tape_ball',
            'venue_name' => 'Test Ground',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'number_of_teams' => 4,
            'city' => 'Test City',
            'match_timings' => 'day',
        ]);

        $team = Team::create([
            'name' => 'Team A',
            'code' => 'TMA',
            'country' => 'PK',
            'city' => 'Lahore',
            'user_id' => $admin->id,
        ]);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/tournaments/{$tournament->id}/teams", [
                'team_ids' => [$team->id],
            ])
            ->assertOk();

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/tournaments/{$tournament->id}/teams", [
                'team_ids' => [$team->id],
            ])
            ->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Team is already added to this tournament.',
            ]);
    }
}
