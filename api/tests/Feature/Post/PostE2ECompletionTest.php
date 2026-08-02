<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostVisibilityEnum;
use App\Enums\User\UserTypeEnum;
use App\Jobs\ExtractPostPosterJob;
use App\Jobs\ProcessPostVideoJob;
use App\Models\Post;
use App\Models\PostSave;
use App\Models\User;
use App\Models\UserFollow;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class PostE2ECompletionTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SystemSettingsSeeder::class);
    }

    private function readyReel(User $owner, array $overrides = []): Post
    {
        return $this->makeVideoPost($owner, array_merge([
            'body' => 'E2E reel',
            'status' => PostStatusEnum::Ready,
            'visibility' => PostVisibilityEnum::Public,
            'published_at' => now(),
            'ready_at' => now(),
            'duration_ms' => 10000,
            'processed_path' => null,
            'hls_master_path' => 'posts/videos/hls/1/enc/master.m3u8',
            'likes_count' => 0,
            'comments_count' => 0,
            'shares_count' => 0,
            'views_count' => 0,
        ], $overrides));
    }

    public function test_public_profile_includes_counts_and_following_flag(): void
    {
        $owner = User::factory()->create([
            'followers_count' => 1,
            'following_count' => 2,
            'reels_count' => 0,
        ]);
        $viewer = User::factory()->create();
        UserFollow::query()->create([
            'follower_id' => $viewer->id,
            'followed_user_id' => $owner->id,
        ]);

        $this->readyReel($owner);
        $this->readyReel($owner);
        $this->readyReel($owner);

        $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/users/'.$owner->id.'/profile')
            ->assertOk()
            ->assertJsonPath('data.reels_count', 3)
            ->assertJsonPath('data.followers_count', 1)
            ->assertJsonPath('data.following_count', 2)
            ->assertJsonPath('data.is_following', true);
    }

    public function test_followers_visibility_is_enforced(): void
    {
        $owner = User::factory()->create();
        $follower = User::factory()->create();
        $stranger = User::factory()->create();
        $reel = $this->readyReel($owner, ['visibility' => PostVisibilityEnum::Followers]);

        UserFollow::query()->create([
            'follower_id' => $follower->id,
            'followed_user_id' => $owner->id,
        ]);

        $this->actingAs($follower, 'api')
            ->getJson('/api/v1/reels/'.$reel->id)
            ->assertOk()
            ->assertJsonPath('data.id', $reel->id);

        $this->actingAs($stranger, 'api')
            ->getJson('/api/v1/reels/'.$reel->id)
            ->assertJsonPath('type', 'NOT_FOUND');
    }

    public function test_saved_feed_returns_bookmarked_reels(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $reel = $this->readyReel($owner);

        PostSave::query()->create([
            'post_id' => $reel->id,
            'user_id' => $viewer->id,
        ]);

        $this->actingAs($viewer, 'api')
            ->getJson('/api/v1/reels/saved')
            ->assertOk()
            ->assertJsonPath('data.items.0.id', $reel->id);
    }

    public function test_multipart_upload_assembles_and_marks_processing(): void
    {
        Storage::fake(config('filesystems.media_disk'));
        Queue::fake();
        Event::fake();

        $user = User::factory()->create();
        $reel = $this->makeVideoPost($user, [
            'user_id' => $user->id,
            'body' => 'Chunked',
            'status' => PostStatusEnum::Uploading,
            'visibility' => PostVisibilityEnum::Public,
        ]);

        $init = $this->actingAs($user, 'api')
            ->postJson('/api/v1/reels/'.$reel->id.'/upload/init')
            ->assertOk()
            ->json('data');

        $uploadId = $init['upload_id'];
        // Minimal ISO BMFF (ftyp/isom) so mobile-format sniff accepts the assembly.
        $mp4Head = "\x00\x00\x00\x18ftypisom\x00\x00\x02\x00isomiso2";
        $partA = UploadedFile::fake()->createWithContent('a.mp4', $mp4Head);
        $partB = UploadedFile::fake()->createWithContent('b.mp4', str_repeat("\0", 32));

        $this->actingAs($user, 'api')
            ->post('/api/v1/reels/'.$reel->id.'/upload/part', [
                'upload_id' => $uploadId,
                'part_number' => 1,
                'file' => $partA,
            ], ['Accept' => 'application/json'])
            ->assertOk();

        $this->actingAs($user, 'api')
            ->post('/api/v1/reels/'.$reel->id.'/upload/part', [
                'upload_id' => $uploadId,
                'part_number' => 2,
                'file' => $partB,
            ], ['Accept' => 'application/json'])
            ->assertOk();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/reels/'.$reel->id.'/upload/complete', [
                'upload_id' => $uploadId,
                'total_parts' => 2,
                'filename' => 'VID_2024.mp4',
                'content_type' => 'video/mp4',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'processing');

        $reel->refresh();
        $this->assertNotNull($reel->videoRaw('original_path'));
        $this->assertStringEndsWith('.mp4', $reel->videoRaw('original_path'));
        Storage::disk(config('filesystems.media_disk'))->assertExists($reel->videoRaw('original_path'));

        Queue::assertPushed(ExtractPostPosterJob::class, function ($job) use ($reel) {
            return $job->postId === $reel->id
                && $job->queue === config('posts.queues.poster');
        });
        Queue::assertPushed(ProcessPostVideoJob::class, function ($job) use ($reel) {
            return $job->postId === $reel->id
                && $job->queue === config('posts.queues.transcode');
        });
    }

    public function test_admin_reel_list_still_works_for_moderation(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $owner = User::factory()->create();
        $reel = $this->readyReel($owner);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/posts')
            ->assertOk()
            ->assertJsonPath('data.0.id', $reel->id);
    }
}
