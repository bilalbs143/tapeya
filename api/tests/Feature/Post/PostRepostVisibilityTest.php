<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\Post\PostVisibilityEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Post;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class PostRepostVisibilityTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    public function test_repost_visibility_is_clamped_to_original(): void
    {
        $author = User::factory()->create();
        $follower = User::factory()->create();
        UserFollow::query()->create([
            'follower_id' => $follower->id,
            'followed_user_id' => $author->id,
        ]);

        $original = $this->makeVideoPost($author, [
            'body' => 'Followers only original',
            'visibility' => PostVisibilityEnum::Followers,
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
            'processed_path' => null,
            'thumbnail_path' => 'posts/videos/thumbs/1/a.jpg',
            'hls_master_path' => 'posts/videos/hls/1/master.m3u8',
        ]);

        $this->actingAs($follower, 'api')
            ->postJson('/api/v1/posts/'.$original->id.'/repost', [
                'body' => 'Sharing',
                'visibility' => 'public',
            ])
            ->assertCreated()
            ->assertJsonPath('data.visibility', 'followers');

        $this->assertDatabaseHas('posts', [
            'user_id' => $follower->id,
            'type' => PostTypeEnum::Repost->value,
            'repost_of_post_id' => $original->id,
            'visibility' => PostVisibilityEnum::Followers->value,
        ]);
    }

    public function test_legacy_public_repost_of_followers_original_redacts_media_for_stranger(): void
    {
        $author = User::factory()->create();
        $reposter = User::factory()->create();
        $stranger = User::factory()->create();
        $followerOfAuthor = User::factory()->create();
        UserFollow::query()->create([
            'follower_id' => $followerOfAuthor->id,
            'followed_user_id' => $author->id,
        ]);

        $original = $this->makeVideoPost($author, [
            'body' => 'Secret clip',
            'visibility' => PostVisibilityEnum::Followers,
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
            'processed_path' => null,
            'thumbnail_path' => 'posts/videos/thumbs/99/clip.jpg',
            'hls_master_path' => 'posts/videos/hls/99/master.m3u8',
        ]);

        // Legacy leak shape: public wrapper of a followers-only original.
        $wrapper = Post::query()->create([
            'user_id' => $reposter->id,
            'type' => PostTypeEnum::Repost,
            'body' => 'Check this',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Public,
            'repost_of_post_id' => $original->id,
            'published_at' => now(),
        ]);

        $strangerPayload = $this->actingAs($stranger, 'api')
            ->getJson('/api/v1/posts/'.$wrapper->id)
            ->assertOk()
            ->assertJsonPath('data.type', 'repost')
            ->assertJsonPath('data.repost_of.id', $original->id)
            ->assertJsonPath('data.repost_of.unavailable', true)
            ->assertJsonPath('data.repost_of.body', null)
            ->assertJsonPath('data.repost_of.cover_url', null)
            ->assertJsonPath('data.repost_of.playback', null)
            ->json('data.repost_of');

        $this->assertNull($strangerPayload['media'] ?? null);
        $this->assertArrayNotHasKey('url', $strangerPayload['playback'] ?? []);
        $this->assertNull($strangerPayload['creator'] ?? null);
        $this->assertNull($strangerPayload['published_at'] ?? null);
        $this->assertArrayNotHasKey('name', $strangerPayload['creator'] ?? []);

        $followerPayload = $this->actingAs($followerOfAuthor, 'api')
            ->getJson('/api/v1/posts/'.$wrapper->id)
            ->assertOk()
            ->assertJsonPath('data.repost_of.body', 'Secret clip')
            ->json('data.repost_of');

        $this->assertTrue(empty($followerPayload['unavailable']));
        $this->assertNotNull($followerPayload['playback']['url'] ?? $followerPayload['playback']['hls_url'] ?? null);
    }

    public function test_repost_update_cannot_widen_past_original(): void
    {
        $author = User::factory()->create();
        $reposter = User::factory()->create();
        UserFollow::query()->create([
            'follower_id' => $reposter->id,
            'followed_user_id' => $author->id,
        ]);

        $original = $this->makeVideoPost($author, [
            'body' => 'Followers original',
            'visibility' => PostVisibilityEnum::Followers,
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
        ]);

        $wrapper = Post::query()->create([
            'user_id' => $reposter->id,
            'type' => PostTypeEnum::Repost,
            'body' => 'Quote',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Followers,
            'repost_of_post_id' => $original->id,
            'published_at' => now(),
        ]);

        $this->actingAs($reposter, 'api')
            ->patchJson('/api/v1/posts/'.$wrapper->id, [
                'visibility' => 'public',
            ])
            ->assertOk()
            ->assertJsonPath('data.visibility', 'followers');

        $this->assertDatabaseHas('posts', [
            'id' => $wrapper->id,
            'visibility' => PostVisibilityEnum::Followers->value,
        ]);
    }

    public function test_tightening_original_cascades_to_child_reposts(): void
    {
        $author = User::factory()->create();
        $reposter = User::factory()->create();
        $stranger = User::factory()->create();

        $original = $this->makeVideoPost($author, [
            'body' => 'Was public',
            'visibility' => PostVisibilityEnum::Public,
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
        ]);

        $wrapper = Post::query()->create([
            'user_id' => $reposter->id,
            'type' => PostTypeEnum::Repost,
            'body' => 'Repost',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Public,
            'repost_of_post_id' => $original->id,
            'published_at' => now(),
        ]);

        $this->actingAs($author, 'api')
            ->patchJson('/api/v1/posts/'.$original->id, [
                'visibility' => 'private',
            ])
            ->assertOk()
            ->assertJsonPath('data.visibility', 'private');

        $this->assertDatabaseHas('posts', [
            'id' => $wrapper->id,
            'visibility' => PostVisibilityEnum::Private->value,
        ]);

        // Private child repost must not appear in explore for strangers.
        $exploreIds = collect($this->getJson('/api/v1/feed')->json('data.items'))->pluck('id')->all();
        $this->assertNotContains($wrapper->id, $exploreIds);

        $this->actingAs($stranger, 'api')
            ->getJson('/api/v1/posts/'.$wrapper->id)
            ->assertNotFound();
    }

    public function test_admin_tightening_original_cascades_and_hides_reposts_from_explore(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $author = User::factory()->create();
        $reposter = User::factory()->create();
        $stranger = User::factory()->create();

        $original = $this->makeVideoPost($author, [
            'body' => 'Public original',
            'visibility' => PostVisibilityEnum::Public,
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
        ]);

        $wrapper = Post::query()->create([
            'user_id' => $reposter->id,
            'type' => PostTypeEnum::Repost,
            'body' => 'Repost',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Public,
            'repost_of_post_id' => $original->id,
            'published_at' => now(),
        ]);

        $this->actingAs($admin, 'api')
            ->patchJson('/api/v1/admin/posts/'.$original->id, [
                'visibility' => 'private',
            ])
            ->assertOk()
            ->assertJsonPath('data.visibility', 'private');

        $this->assertDatabaseHas('posts', [
            'id' => $wrapper->id,
            'visibility' => PostVisibilityEnum::Private->value,
        ]);

        $exploreIds = collect($this->getJson('/api/v1/feed')->json('data.items'))->pluck('id')->all();
        $this->assertNotContains($wrapper->id, $exploreIds);

        $this->actingAs($stranger, 'api')
            ->getJson('/api/v1/posts/'.$wrapper->id)
            ->assertNotFound();
    }

    public function test_admin_cannot_widen_repost_past_original(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $author = User::factory()->create();
        $reposter = User::factory()->create();

        $original = $this->makeVideoPost($author, [
            'body' => 'Followers original',
            'visibility' => PostVisibilityEnum::Followers,
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
        ]);

        $wrapper = Post::query()->create([
            'user_id' => $reposter->id,
            'type' => PostTypeEnum::Repost,
            'body' => 'Quote',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Followers,
            'repost_of_post_id' => $original->id,
            'published_at' => now(),
        ]);

        $this->actingAs($admin, 'api')
            ->patchJson('/api/v1/admin/posts/'.$wrapper->id, [
                'visibility' => 'public',
            ])
            ->assertOk()
            ->assertJsonPath('data.visibility', 'followers');

        $this->assertDatabaseHas('posts', [
            'id' => $wrapper->id,
            'visibility' => PostVisibilityEnum::Followers->value,
        ]);
    }
}
