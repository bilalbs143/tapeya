<?php

namespace Tests\Feature\Admin;

use App\Enums\Event\MatchKindEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\CricketMatch;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\QuickMatch\CreatesQuickMatch;
use Tests\Support\Scoring\BuildsScoringMatch;
use Tests\TestCase;

class AdminQuickMatchTest extends TestCase
{
    use BuildsScoringMatch;
    use CreatesQuickMatch;
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
    }

    private function owner(): User
    {
        return User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => 'active',
            'name' => 'Usman Owner',
        ]);
    }

    public function test_admin_can_list_and_filter_quick_matches(): void
    {
        $admin = $this->admin();
        $owner = $this->owner();
        $other = User::factory()->create(['type' => UserTypeEnum::USER, 'status' => 'active', 'name' => 'Other']);

        $mine = $this->createQuickMatch($owner, ['venue_name' => 'Street Ground']);
        $this->createQuickMatch($other, ['status' => MatchStatusEnum::CANCELLED->value]);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/quick-matches?all=1')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/quick-matches?status=scheduled&all=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $mine->id);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/quick-matches?created_by='.$owner->id.'&all=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.created_by.id', $owner->id);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/quick-matches?q=Usman&all=1')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_show_includes_sides_and_excludes_tournament_matches(): void
    {
        $admin = $this->admin();
        $owner = $this->owner();
        $match = $this->createQuickMatch($owner);

        $this->actingAs($admin, 'api')
            ->getJson("/api/v1/admin/quick-matches/{$match->id}")
            ->assertOk()
            ->assertJsonPath('data.kind', MatchKindEnum::QUICK->value)
            ->assertJsonPath('data.tournament', null)
            ->assertJsonPath('data.created_by.name', 'Usman Owner')
            ->assertJsonMissingPath('data.can_operate')
            ->assertJsonMissingPath('data.is_owner');

        $this->setUpScoringMatch();

        $this->actingAs($admin, 'api')
            ->getJson("/api/v1/admin/quick-matches/{$this->scoringMatch->id}")
            ->assertNotFound();
    }

    public function test_admin_can_cancel_scheduled_quick_match(): void
    {
        $admin = $this->admin();
        $owner = $this->owner();
        $match = $this->createQuickMatch($owner);
        $homeId = (int) $match->home_team_id;
        $awayId = (int) $match->away_team_id;

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/quick-matches/{$match->id}/cancel", [
                'comments' => 'Abuse report.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', MatchStatusEnum::CANCELLED->value)
            ->assertJsonPath('data.cancel_comments', 'Abuse report.');

        $fresh = CricketMatch::query()->find($match->id);
        $this->assertSame(MatchStatusEnum::CANCELLED, $fresh->status);
        $this->assertNotNull(Team::query()->find($homeId));
        $this->assertNotNull(Team::query()->find($awayId));
    }

    public function test_admin_cancel_already_cancelled_is_conflict(): void
    {
        $admin = $this->admin();
        $owner = $this->owner();
        $match = $this->createQuickMatch($owner, ['status' => MatchStatusEnum::CANCELLED->value]);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/quick-matches/{$match->id}/cancel")
            ->assertStatus(409);
    }

    public function test_app_user_cannot_use_admin_quick_match_routes(): void
    {
        $owner = $this->owner();
        $match = $this->createQuickMatch($owner);

        $this->actingAs($owner, 'api')
            ->getJson('/api/v1/admin/quick-matches')
            ->assertForbidden();

        $this->actingAs($owner, 'api')
            ->postJson("/api/v1/admin/quick-matches/{$match->id}/cancel")
            ->assertForbidden();
    }
}
