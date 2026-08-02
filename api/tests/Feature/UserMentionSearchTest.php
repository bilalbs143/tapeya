<?php

namespace Tests\Feature;

use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserMentionSearchTest extends TestCase
{
    use RefreshDatabase;

    private function activeUser(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ], $overrides));
    }

    public function test_guest_cannot_search_users_for_mentions(): void
    {
        $this->getJson('/api/v1/users/search')
            ->assertUnauthorized();
    }

    public function test_empty_query_returns_followed_users_first_with_nicknames_only(): void
    {
        $viewer = $this->activeUser(['nickname' => 'viewer_one']);
        $followed = $this->activeUser(['name' => 'Followed User', 'nickname' => 'followed_user']);
        $other = $this->activeUser(['name' => 'Other User', 'nickname' => 'other_user']);
        $noNick = $this->activeUser(['name' => 'No Handle', 'nickname' => null]);
        $admin = User::factory()->create([
            'type' => UserTypeEnum::ADMINISTRATOR,
            'status' => UserStatusEnum::ACTIVE,
            'nickname' => 'admin_user',
        ]);

        UserFollow::query()->create([
            'follower_id' => $viewer->id,
            'followed_user_id' => $followed->id,
        ]);

        $response = $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/users/search')
            ->assertOk();

        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertSame($followed->id, $ids[0]);
        $this->assertContains($other->id, $ids);
        $this->assertNotContains($viewer->id, $ids);
        $this->assertNotContains($noNick->id, $ids);
        $this->assertNotContains($admin->id, $ids);
        $this->assertSame('followed_user', $response->json('data.0.nickname'));
    }

    public function test_query_matches_name_and_nickname_not_email(): void
    {
        $viewer = $this->activeUser(['nickname' => 'viewer_one']);
        $byNick = $this->activeUser(['name' => 'Alpha', 'nickname' => 'rocket_man', 'email' => 'hidden@example.com']);
        $byName = $this->activeUser(['name' => 'Rocket League', 'nickname' => 'league_fan', 'email' => 'other@example.com']);
        $emailOnly = $this->activeUser(['name' => 'Secret', 'nickname' => 'secret_user', 'email' => 'rocket@example.com']);

        $ids = collect(
            $this->actingAs($viewer, 'api')
                ->getJson('/api/v1/users/search?q=rocket')
                ->assertOk()
                ->json('data')
        )->pluck('id')->all();

        $this->assertContains($byNick->id, $ids);
        $this->assertContains($byName->id, $ids);
        $this->assertNotContains($emailOnly->id, $ids);
    }

    public function test_inactive_users_are_excluded(): void
    {
        $viewer = $this->activeUser(['nickname' => 'viewer_one']);
        $blocked = $this->activeUser([
            'nickname' => 'blocked_guy',
            'status' => UserStatusEnum::BLOCKED,
        ]);

        $ids = collect(
            $this->actingAs($viewer, 'api')
                ->getJson('/api/v1/users/search?q=blocked')
                ->assertOk()
                ->json('data')
        )->pluck('id')->all();

        $this->assertNotContains($blocked->id, $ids);
    }
}
