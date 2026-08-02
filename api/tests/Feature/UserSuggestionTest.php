<?php

namespace Tests\Feature;

use App\Enums\User\PlayingRoleEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSuggestionTest extends TestCase
{
    use RefreshDatabase;

    private function activeUser(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'nickname' => 'user_'.uniqid(),
        ], $overrides));
    }

    public function test_guest_cannot_fetch_suggestions(): void
    {
        $this->getJson('/api/v1/users/suggestions')
            ->assertUnauthorized();
    }

    public function test_suggestions_exclude_self_and_already_followed(): void
    {
        $viewer = $this->activeUser(['nickname' => 'viewer_one']);
        $followed = $this->activeUser([
            'nickname' => 'already_followed',
            'is_official' => true,
            'followers_count' => 9999,
        ]);
        $candidate = $this->activeUser([
            'nickname' => 'candidate_one',
            'followers_count' => 10,
        ]);

        UserFollow::query()->create([
            'follower_id' => $viewer->id,
            'followed_user_id' => $followed->id,
        ]);

        $ids = collect(
            $this->actingAs($viewer, 'api')
                ->getJson('/api/v1/users/suggestions')
                ->assertOk()
                ->json('data')
        )->pluck('id')->all();

        $this->assertContains($candidate->id, $ids);
        $this->assertNotContains($viewer->id, $ids);
        $this->assertNotContains($followed->id, $ids);
    }

    public function test_suggestions_prefer_official_then_followers(): void
    {
        $viewer = $this->activeUser(['nickname' => 'viewer_one']);
        $popular = $this->activeUser([
            'nickname' => 'popular_creator',
            'is_official' => false,
            'followers_count' => 5000,
            'posts_count' => 100,
        ]);
        $official = $this->activeUser([
            'nickname' => 'official_account',
            'is_official' => true,
            'followers_count' => 20,
            'posts_count' => 2,
        ]);

        $ids = collect(
            $this->actingAs($viewer, 'api')
                ->getJson('/api/v1/users/suggestions?limit=2')
                ->assertOk()
                ->json('data')
        )->pluck('id')->all();

        $this->assertSame([$official->id, $popular->id], $ids);
    }

    public function test_suggestions_respect_limit_and_include_subtitle(): void
    {
        $viewer = $this->activeUser(['nickname' => 'viewer_one']);
        $this->activeUser([
            'nickname' => 'role_player',
            'playing_role' => PlayingRoleEnum::BATSMAN,
            'followers_count' => 12,
        ]);
        $this->activeUser([
            'nickname' => 'official_only',
            'is_official' => true,
            'followers_count' => 0,
        ]);
        $this->activeUser([
            'nickname' => 'plain_user',
            'followers_count' => 3,
        ]);
        $this->activeUser([
            'nickname' => 'extra_user',
            'followers_count' => 1,
        ]);

        $response = $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/users/suggestions?limit=3')
            ->assertOk()
            ->assertJsonCount(3, 'data');

        $first = collect($response->json('data'))->firstWhere('nickname', 'official_only');
        $this->assertNotNull($first);
        $this->assertSame('Official account', $first['subtitle']);
        $this->assertFalse($first['is_following']);

        $withRole = collect($response->json('data'))->firstWhere('nickname', 'role_player');
        if ($withRole) {
            $this->assertSame('Batsman', $withRole['subtitle']);
        }
    }

    public function test_suggestions_default_to_a_twenty_user_buffer_and_cap_larger_requests(): void
    {
        $viewer = $this->activeUser(['nickname' => 'viewer_one']);

        foreach (range(1, 22) as $index) {
            $this->activeUser([
                'nickname' => 'buffer_candidate_'.$index,
                'followers_count' => $index,
            ]);
        }

        $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/users/suggestions')
            ->assertOk()
            ->assertJsonCount(20, 'data');

        $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/users/suggestions?limit=100')
            ->assertOk()
            ->assertJsonCount(20, 'data');
    }

    public function test_suggestions_exclude_users_without_nickname_and_admins(): void
    {
        $viewer = $this->activeUser(['nickname' => 'viewer_one']);
        $valid = $this->activeUser(['nickname' => 'valid_user', 'followers_count' => 5]);
        $this->activeUser(['nickname' => null, 'followers_count' => 999]);
        User::factory()->create([
            'type' => UserTypeEnum::ADMINISTRATOR,
            'status' => UserStatusEnum::ACTIVE,
            'nickname' => 'admin_user',
            'followers_count' => 999,
            'is_official' => true,
        ]);

        $ids = collect(
            $this->actingAs($viewer, 'api')
                ->getJson('/api/v1/users/suggestions')
                ->assertOk()
                ->json('data')
        )->pluck('id')->all();

        $this->assertContains($valid->id, $ids);
        $this->assertCount(1, $ids);
    }
}
