<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\Post\PostVisibilityEnum;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostMedia;
use App\Models\PostSave;
use App\Models\User;
use App\Models\UserFollow;
use App\Services\Post\PostFeedService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class FeedAndComposeTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    public function test_mixed_feed_includes_text_and_video(): void
    {
        $user = User::factory()->create();

        $this->makeVideoPost($user, [
            'body' => 'Video post',
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
        ]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/posts', [
                'type' => 'text',
                'body' => 'Hello timeline',
                'visibility' => 'public',
            ])
            ->assertCreated()
            ->assertJsonPath('data.type', 'text')
            ->assertJsonPath('data.body', 'Hello timeline');

        $response = $this->getJson('/api/v1/feed');
        $response->assertOk();
        $types = collect($response->json('data.items'))->pluck('type')->all();
        $this->assertContains('text', $types);
        $this->assertContains('video', $types);
    }

    public function test_feed_returns_latest_top_level_comment_and_eager_loads_its_author(): void
    {
        $author = User::factory()->create();
        $firstCommenter = User::factory()->create();
        $latestCommenter = User::factory()->create();

        $post = Post::query()->create([
            'user_id' => $author->id,
            'type' => PostTypeEnum::Text,
            'body' => 'Comment preview post',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Public,
            'comments_count' => 3,
            'published_at' => now(),
        ]);

        PostComment::query()->create([
            'post_id' => $post->id,
            'user_id' => $firstCommenter->id,
            'body' => 'Older top-level comment',
        ]);
        $latest = PostComment::query()->create([
            'post_id' => $post->id,
            'user_id' => $latestCommenter->id,
            'body' => 'Latest top-level comment',
        ]);
        PostComment::query()->create([
            'post_id' => $post->id,
            'user_id' => $firstCommenter->id,
            'parent_id' => $latest->id,
            'body' => 'Newer reply that must not become the preview',
        ]);

        $this->actingAs($author, 'api')
            ->getJson('/api/v1/feed')
            ->assertOk()
            ->assertJsonPath('data.items.0.latest_comment.id', $latest->id)
            ->assertJsonPath('data.items.0.latest_comment.body', 'Latest top-level comment')
            ->assertJsonPath('data.items.0.latest_comment.user.id', $latestCommenter->id)
            ->assertJsonPath('data.items.0.latest_comment.user.name', $latestCommenter->name);

        $feedPost = collect(app(PostFeedService::class)->explore(null, 10)->items())
            ->firstWhere('id', $post->id);

        $this->assertNotNull($feedPost);
        $this->assertTrue($feedPost->relationLoaded('latestComment'));
        $this->assertTrue($feedPost->latestComment->relationLoaded('user'));
    }

    public function test_following_feed_includes_followers_only_posts(): void
    {
        $creator = User::factory()->create();
        $follower = User::factory()->create();
        UserFollow::query()->create([
            'follower_id' => $follower->id,
            'followed_user_id' => $creator->id,
        ]);

        $this->makeVideoPost($creator, [
            'body' => 'Followers only',
            'visibility' => PostVisibilityEnum::Followers,
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
        ]);

        $this->actingAs($follower, 'api')
            ->getJson('/api/v1/feed/following')
            ->assertOk()
            ->assertJsonPath('data.items.0.caption', 'Followers only');

        // Explore must NOT include followers-only
        $captions = collect($this->getJson('/api/v1/feed')->json('data.items'))->pluck('caption')->all();
        $this->assertNotContains('Followers only', $captions);
    }

    public function test_saved_feed_returns_mixed_bookmarked_posts(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();

        $video = $this->makeVideoPost($owner, [
            'body' => 'Saved video',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Public,
            'published_at' => now(),
        ]);

        $text = Post::query()->create([
            'user_id' => $owner->id,
            'type' => PostTypeEnum::Text,
            'body' => 'Saved text',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Public,
            'published_at' => now(),
        ]);

        PostSave::query()->create(['post_id' => $video->id, 'user_id' => $viewer->id]);
        PostSave::query()->create(['post_id' => $text->id, 'user_id' => $viewer->id]);

        $items = $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/feed/saved')
            ->assertOk()
            ->json('data.items');

        $ids = collect($items)->pluck('id')->all();
        $types = collect($items)->pluck('type')->all();

        $this->assertContains($video->id, $ids);
        $this->assertContains($text->id, $ids);
        $this->assertContains('video', $types);
        $this->assertContains('text', $types);
    }

    public function test_feed_mine_returns_mixed_owned_posts(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $video = $this->makeVideoPost($owner, [
            'body' => 'My video',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Public,
            'published_at' => now(),
        ]);

        $text = Post::query()->create([
            'user_id' => $owner->id,
            'type' => PostTypeEnum::Text,
            'body' => 'My text',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Public,
            'published_at' => now(),
        ]);

        $this->makeVideoPost($other, [
            'body' => 'Someone else',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Public,
            'published_at' => now(),
        ]);

        $items = $this->actingAs($owner, 'api')
            ->getJson('/api/v1/feed/mine')
            ->assertOk()
            ->json('data.items');

        $ids = collect($items)->pluck('id')->all();
        $types = collect($items)->pluck('type')->all();

        $this->assertContains($video->id, $ids);
        $this->assertContains($text->id, $ids);
        $this->assertNotContains(
            Post::query()->where('user_id', $other->id)->value('id'),
            $ids,
        );
        $this->assertContains('video', $types);
        $this->assertContains('text', $types);
    }

    public function test_user_can_repost_to_feed(): void
    {
        $author = User::factory()->create();
        $reposter = User::factory()->create();
        $original = $this->makeVideoPost($author, [
            'body' => 'Original clip',
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
        ]);

        $this->actingAs($reposter, 'api')
            ->postJson('/api/v1/posts/'.$original->id.'/repost', [
                'body' => 'Must watch',
            ])
            ->assertCreated()
            ->assertJsonPath('data.type', 'repost')
            ->assertJsonPath('data.body', 'Must watch')
            ->assertJsonPath('data.repost_of.id', $original->id);

        $this->assertDatabaseHas('posts', [
            'user_id' => $reposter->id,
            'type' => PostTypeEnum::Repost->value,
            'repost_of_post_id' => $original->id,
        ]);
    }

    public function test_user_can_compose_image_post(): void
    {
        Storage::fake(config('filesystems.media_disk'));
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'api')
            ->post('/api/v1/posts', [
                'type' => 'image',
                'body' => 'Match day',
                'images' => [
                    UploadedFile::fake()->image('a.jpg'),
                ],
            ])
            ->assertCreated()
            ->assertJsonPath('data.type', 'image')
            ->assertJsonPath('data.body', 'Match day');

        $cover = $response->json('data.cover_url');
        $this->assertNotEmpty($cover);
        $this->assertStringNotContainsString('/storage/0', (string) $cover);

        $mediaPath = PostMedia::query()->where('post_id', $response->json('data.id'))->value('path');
        $this->assertIsString($mediaPath);
        $this->assertNotSame('0', $mediaPath);
        $this->assertNotSame('', $mediaPath);
        Storage::disk(config('filesystems.media_disk'))->assertExists($mediaPath);
    }

    public function test_compose_text_persists_background_id(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/posts', [
                'type' => 'text',
                'body' => 'What a boundary',
                'background_id' => 'bats',
                'visibility' => 'public',
            ])
            ->assertCreated()
            ->assertJsonPath('data.type', 'text')
            ->assertJsonPath('data.background_id', 'bats');

        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'type' => PostTypeEnum::Text->value,
            'background_id' => 'bats',
        ]);

        $postId = Post::query()->where('user_id', $user->id)->where('background_id', 'bats')->value('id');

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/posts/'.$postId)
            ->assertOk()
            ->assertJsonPath('data.background_id', 'bats');

        $this->getJson('/api/v1/feed')
            ->assertOk()
            ->assertJsonFragment(['id' => $postId, 'background_id' => 'bats']);
    }

    public function test_compose_text_plain_background_stores_null(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/posts', [
                'type' => 'text',
                'body' => 'Plain caption',
                'background_id' => 'plain',
            ])
            ->assertCreated()
            ->assertJsonPath('data.background_id', null);
    }

    public function test_compose_rejects_unknown_background_id(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/posts', [
                'type' => 'text',
                'body' => 'Nope',
                'background_id' => 'not-a-real-bg',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['background_id']);
    }

    public function test_compose_image_accepts_multiple_images(): void
    {
        Storage::fake(config('filesystems.media_disk'));
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'api')
            ->post('/api/v1/posts', [
                'type' => 'image',
                'body' => 'Gallery',
                'images' => [
                    UploadedFile::fake()->image('a.jpg'),
                    UploadedFile::fake()->image('b.jpg'),
                ],
            ])
            ->assertCreated()
            ->assertJsonPath('data.type', 'image');

        $media = $response->json('data.media');
        $this->assertIsArray($media);
        $this->assertCount(2, $media);
    }

    public function test_show_hides_private_post_from_strangers(): void
    {
        $author = User::factory()->create();
        $stranger = User::factory()->create();
        $post = $this->makeVideoPost($author, [
            'body' => 'Secret',
            'visibility' => PostVisibilityEnum::Private,
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
        ]);

        $this->actingAs($stranger, 'api')
            ->getJson('/api/v1/posts/'.$post->id)
            ->assertNotFound();

        $this->actingAs($author, 'api')
            ->getJson('/api/v1/posts/'.$post->id)
            ->assertOk()
            ->assertJsonPath('data.body', 'Secret');
    }

    public function test_show_allows_followers_visibility_for_follower(): void
    {
        $creator = User::factory()->create();
        $follower = User::factory()->create();
        $stranger = User::factory()->create();
        UserFollow::query()->create([
            'follower_id' => $follower->id,
            'followed_user_id' => $creator->id,
        ]);

        $post = $this->makeVideoPost($creator, [
            'body' => 'Followers clip',
            'visibility' => PostVisibilityEnum::Followers,
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
        ]);

        $this->actingAs($follower, 'api')
            ->getJson('/api/v1/posts/'.$post->id)
            ->assertOk()
            ->assertJsonPath('data.body', 'Followers clip');

        $this->actingAs($stranger, 'api')
            ->getJson('/api/v1/posts/'.$post->id)
            ->assertNotFound();
    }

    public function test_user_posts_endpoint_returns_non_video_posts_only(): void
    {
        $author = User::factory()->create();
        $stranger = User::factory()->create();

        $this->makeVideoPost($author, [
            'body' => 'A reel',
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
        ]);

        Post::query()->create([
            'user_id' => $author->id,
            'type' => PostTypeEnum::Text,
            'body' => 'Public text',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Public,
            'published_at' => now(),
        ]);

        Post::query()->create([
            'user_id' => $author->id,
            'type' => PostTypeEnum::Image,
            'body' => 'Followers image',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Followers,
            'published_at' => now()->subSecond(),
        ]);

        $strangerPosts = $this->actingAs($stranger, 'api')
            ->getJson('/api/v1/users/'.$author->id.'/posts')
            ->assertOk()
            ->json('data.items');

        $this->assertSame(['text'], collect($strangerPosts)->pluck('type')->all());
        $this->assertSame(['Public text'], collect($strangerPosts)->pluck('body')->all());

        $ownerPosts = $this->actingAs($author, 'api')
            ->getJson('/api/v1/users/'.$author->id.'/posts')
            ->assertOk()
            ->json('data.items');

        $this->assertEqualsCanonicalizing(['text', 'image'], collect($ownerPosts)->pluck('type')->all());

        $this->actingAs($stranger, 'api')
            ->getJson('/api/v1/users/'.$author->id.'/reels')
            ->assertOk()
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.type', 'video');

        $this->actingAs($stranger, 'api')
            ->getJson('/api/v1/users/'.$author->id.'/profile')
            ->assertOk()
            ->assertJsonPath('data.posts_count', 1)
            ->assertJsonPath('data.reels_count', 1);
    }

    public function test_compose_video_returns_upload_contract(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/posts', [
                'type' => 'video',
                'body' => 'Shell',
                'visibility' => 'public',
            ])
            ->assertCreated()
            ->assertJsonPath('data.type', 'video')
            ->assertJsonPath('data.status', 'uploading')
            ->assertJsonPath('data.upload.type', 'reel')
            ->assertJsonPath('data.upload.field', 'original');
    }
}
