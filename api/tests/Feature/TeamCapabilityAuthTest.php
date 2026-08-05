<?php

namespace Tests\Feature;

use App\Enums\User\AdminRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Models\Role;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamCapabilityAuthTest extends TestCase
{
    use RefreshDatabase;

    private function createTeamFor(User $owner, string $suffix = 'A'): Team
    {
        return Team::create([
            'name' => "Team {$suffix}",
            'code' => 'T'.$suffix.uniqid(),
            'country' => 'PK',
            'city' => 'Lahore',
            'user_id' => $owner->id,
            'created_by' => $owner->id,
        ]);
    }

    private function createTournamentFor(User $organizer): Tournament
    {
        return Tournament::create([
            'organizer_id' => $organizer->id,
            'created_by' => $organizer->id,
            'tournament_name' => 'Capability Cup',
            'tournament_type' => 'league',
            'cricket_format' => 'tape_ball',
            'venue_name' => 'Ground',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'number_of_teams' => 4,
            'city' => 'Lahore',
            'match_timings' => 'day',
        ]);
    }

    public function test_owner_can_manage_squad_without_any_roles(): void
    {
        $owner = User::factory()->create(['type' => 'user']);
        $team = $this->createTeamFor($owner);
        $player = User::factory()->create(['type' => 'user']);

        $this->assertTrue($owner->roles()->doesntExist());

        $this->actingAs($owner, 'api')
            ->postJson("/api/v1/teams/{$team->id}/squad", [
                'player_ids' => [$player->id],
            ])
            ->assertOk()
            ->assertJsonPath('data.player_ids.0', $player->id);
    }

    public function test_unrelated_user_with_admin_broadcast_role_cannot_update_team(): void
    {
        $owner = User::factory()->create(['type' => 'user']);
        $stranger = User::factory()->create(['type' => 'user']);
        $role = Role::query()->firstOrCreate(
            ['slug' => AdminRoleEnum::BROADCASTER->value, 'guard' => RoleGuardEnum::ADMIN->value],
            ['name' => 'Broadcast Operator']
        );
        $stranger->roles()->syncWithoutDetaching([$role->id]);

        $team = $this->createTeamFor($owner);

        $this->actingAs($stranger, 'api')
            ->putJson("/api/v1/teams/{$team->id}", [
                'name' => 'Hacked Name',
                'code' => $team->code,
                'country' => 'PK',
                'city' => 'Karachi',
            ])
            ->assertForbidden();
    }

    public function test_tournament_staff_can_manage_squad_for_team_in_their_tournament(): void
    {
        $owner = User::factory()->create(['type' => 'user']);
        $staff = User::factory()->create(['type' => 'user']);
        $team = $this->createTeamFor($owner);
        $tournament = $this->createTournamentFor($staff);
        $tournament->teams()->attach($team->id);

        $player = User::factory()->create(['type' => 'user']);

        $this->actingAs($staff, 'api')
            ->postJson("/api/v1/teams/{$team->id}/squad", [
                'player_ids' => [$player->id],
            ])
            ->assertOk();
    }

    public function test_non_owner_non_staff_cannot_edit_team(): void
    {
        $owner = User::factory()->create(['type' => 'user']);
        $stranger = User::factory()->create(['type' => 'user']);
        $team = $this->createTeamFor($owner);

        $this->actingAs($stranger, 'api')
            ->putJson("/api/v1/teams/{$team->id}", [
                'name' => 'Nope',
                'code' => $team->code,
                'country' => 'PK',
                'city' => 'Lahore',
            ])
            ->assertForbidden();
    }

    public function test_app_user_can_create_team_for_self(): void
    {
        $user = User::factory()->create(['type' => 'user']);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/teams', [
                'name' => 'My Side',
                'code' => 'MYS'.uniqid(),
                'country' => 'PK',
                'city' => 'Lahore',
            ])
            ->assertCreated()
            ->assertJsonPath('data.sponsor_id', $user->id);
    }

    public function test_app_user_cannot_create_team_for_another_user(): void
    {
        $user = User::factory()->create(['type' => 'user']);
        $other = User::factory()->create(['type' => 'user']);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/teams', [
                'name' => 'Other Side',
                'code' => 'OTH'.uniqid(),
                'country' => 'PK',
                'city' => 'Lahore',
                'sponsor_user_id' => $other->id,
            ])
            ->assertForbidden();
    }

    public function test_app_user_cannot_change_team_ownership(): void
    {
        $owner = User::factory()->create(['type' => 'user']);
        $other = User::factory()->create(['type' => 'user']);
        $team = $this->createTeamFor($owner);

        $this->actingAs($owner, 'api')
            ->putJson("/api/v1/teams/{$team->id}", [
                'name' => $team->name,
                'code' => $team->code,
                'country' => 'PK',
                'city' => 'Lahore',
                'sponsor_user_id' => $other->id,
            ])
            ->assertForbidden();
    }

    public function test_me_exposes_assignment_based_capabilities(): void
    {
        $user = User::factory()->create(['type' => 'user']);
        $this->createTeamFor($user);
        $this->createTournamentFor($user);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('data.capabilities.team_owner', true)
            ->assertJsonPath('data.capabilities.tournament_manager', true)
            ->assertJsonPath('data.capabilities.vendor_status', null)
            ->assertJsonMissingPath('data.roles');
    }
}
