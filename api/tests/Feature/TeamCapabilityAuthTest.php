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
            'tournament_type' => 'open_tournament',
            'venue_name' => 'Ground',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'number_of_teams' => 4,
            'city' => 'Lahore',
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
            ->assertJsonPath('data.owner_id', $user->id);
    }

    public function test_app_user_can_set_free_text_sponsor_and_icon_players(): void
    {
        $user = User::factory()->create(['type' => 'user']);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/teams', [
                'name' => 'Named Side',
                'code' => 'NAM'.uniqid(),
                'country' => 'PK',
                'city' => 'Lahore',
                'sponsor' => 'Pepsi Cricket, Jazz',
                'icon_players' => 'Babar Azam, Shaheen Afridi, Babar Azam',
            ])
            ->assertCreated()
            ->assertJsonPath('data.sponsor', 'Pepsi Cricket, Jazz')
            ->assertJsonPath('data.icon_players', 'Babar Azam, Shaheen Afridi, Babar Azam')
            ->assertJsonPath('data.owner_id', $user->id)
            ->assertJsonMissingPath('data.sponsor_id')
            ->assertJsonMissingPath('data.icon_player_ids');
    }

    public function test_app_user_can_update_and_clear_free_text_fields(): void
    {
        $owner = User::factory()->create(['type' => 'user']);
        $team = $this->createTeamFor($owner);
        $team->update([
            'sponsor' => 'Old Sponsor',
            'icon_players' => 'Old Icon',
        ]);

        $this->actingAs($owner, 'api')
            ->putJson("/api/v1/teams/{$team->id}", [
                'name' => $team->name,
                'code' => $team->code,
                'country' => 'PK',
                'city' => 'Lahore',
                'sponsor' => '  New Sponsor, Brand X  ',
                'icon_players' => '  Player One, Player Two  ',
            ])
            ->assertOk()
            ->assertJsonPath('data.sponsor', 'New Sponsor, Brand X')
            ->assertJsonPath('data.icon_players', 'Player One, Player Two');

        $this->actingAs($owner, 'api')
            ->putJson("/api/v1/teams/{$team->id}", [
                'name' => $team->name,
                'code' => $team->code,
                'country' => 'PK',
                'city' => 'Lahore',
                'sponsor' => '',
                'icon_players' => '',
            ])
            ->assertOk()
            ->assertJsonPath('data.sponsor', null)
            ->assertJsonPath('data.icon_players', null);
    }

    public function test_admin_can_create_team_with_owner_and_free_text_fields(): void
    {
        $admin = User::factory()->create(['type' => 'administrator']);
        $owner = User::factory()->create(['type' => 'user']);

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/teams', [
                'name' => 'Admin Side',
                'code' => 'ADM'.uniqid(),
                'country' => 'PK',
                'city' => 'Karachi',
                'sponsor' => 'Pepsi, Jazz, Imad Waseem',
                'icon_players' => 'Babar Azam, Shaheen Afridi',
                'owner_user_id' => $owner->id,
            ])
            ->assertCreated()
            ->assertJsonPath('data.owner_id', $owner->id)
            ->assertJsonPath('data.sponsor', 'Pepsi, Jazz, Imad Waseem')
            ->assertJsonPath('data.icon_players', 'Babar Azam, Shaheen Afridi');
    }

    public function test_me_has_no_capability_bag(): void
    {
        $user = User::factory()->create(['type' => 'user']);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonMissingPath('data.capabilities')
            ->assertJsonMissingPath('data.vendor')
            ->assertJsonMissingPath('data.roles');
    }

    public function test_teams_mine_returns_only_owned_teams(): void
    {
        $owner = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $other = User::factory()->create(['type' => 'user', 'status' => 'active']);
        $mine = $this->createTeamFor($owner, 'Mine');
        $theirs = $this->createTeamFor($other, 'Theirs');

        $response = $this->actingAs($owner, 'api')
            ->getJson('/api/v1/teams?mine=1')
            ->assertOk();

        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($mine->id));
        $this->assertFalse($ids->contains($theirs->id));
    }
}
