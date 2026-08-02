<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\Post\PostVisibilityEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Post;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class OfficialAccountBadgeTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    public function test_feed_creator_includes_is_official_flag(): void
    {
        $official = User::factory()->create(['is_official' => true]);
        $regular = User::factory()->create(['is_official' => false]);
        $viewer = User::factory()->create();

        $this->makeVideoPost($official, [
            'body' => 'Official clip',
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
        ]);
        $this->makeVideoPost($regular, [
            'body' => 'Regular clip',
            'status' => PostStatusEnum::Ready,
            'published_at' => now()->subSecond(),
        ]);

        $items = collect(
            $this->actingAs($viewer, 'api')
                ->getJson('/api/v1/feed')
                ->assertOk()
                ->json('data.items')
        );

        $officialItem = $items->firstWhere('caption', 'Official clip');
        $regularItem = $items->firstWhere('caption', 'Regular clip');

        $this->assertNotNull($officialItem);
        $this->assertNotNull($regularItem);
        $this->assertTrue($officialItem['creator']['is_official']);
        $this->assertFalse($regularItem['creator']['is_official']);
    }

    public function test_public_profile_and_mentions_expose_is_official(): void
    {
        $official = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'nickname' => 'pcb_official',
            'is_official' => true,
        ]);
        $viewer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'nickname' => 'viewer_one',
        ]);

        $this->actingAs($viewer, 'api')
            ->getJson("/api/v1/users/{$official->id}/profile")
            ->assertOk()
            ->assertJsonPath('data.is_official', true);

        $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/users/search?q=pcb_official')
            ->assertOk()
            ->assertJsonPath('data.0.is_official', true);
    }

    public function test_redacted_repost_does_not_leak_official_creator(): void
    {
        $author = User::factory()->create(['is_official' => true]);
        $reposter = User::factory()->create();
        $stranger = User::factory()->create();
        $followerOfAuthor = User::factory()->create();
        UserFollow::query()->create([
            'follower_id' => $followerOfAuthor->id,
            'followed_user_id' => $author->id,
        ]);

        $original = $this->makeVideoPost($author, [
            'body' => 'Secret official',
            'visibility' => PostVisibilityEnum::Followers,
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
        ]);

        $wrapper = Post::query()->create([
            'user_id' => $reposter->id,
            'type' => PostTypeEnum::Repost,
            'body' => 'Seen this?',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Public,
            'published_at' => now(),
            'repost_of_post_id' => $original->id,
        ]);

        $redacted = $this->actingAs($stranger, 'api')
            ->getJson('/api/v1/posts/'.$wrapper->id)
            ->assertOk()
            ->assertJsonPath('data.repost_of.unavailable', true)
            ->json('data.repost_of');

        $this->assertNull($redacted['creator'] ?? null);

        $this->actingAs($followerOfAuthor, 'api')
            ->getJson('/api/v1/posts/'.$wrapper->id)
            ->assertOk()
            ->assertJsonPath('data.repost_of.creator.is_official', true);
    }

    public function test_admin_can_toggle_is_official_on_user_update(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $user = User::factory()->create(['is_official' => false]);

        $this->actingAs($admin, 'api')
            ->putJson("/api/v1/admin/users/{$user->id}", [
                'name' => $user->name,
                'is_official' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.is_official', true);

        $this->assertTrue($user->fresh()->is_official);

        $this->actingAs($admin, 'api')
            ->putJson("/api/v1/admin/users/{$user->id}", [
                'name' => $user->name,
                'is_official' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.is_official', false);

        $this->assertFalse($user->fresh()->is_official);
    }
}
