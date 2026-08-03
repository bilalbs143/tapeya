<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\User\UserTypeEnum;
use App\Jobs\CleanupPostMediaJob;
use App\Jobs\CleanupPostOriginalJob;
use App\Jobs\ExtractPostPosterJob;
use App\Jobs\ProcessPostVideoJob;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostMedia;
use App\Models\PostReport;
use App\Models\User;
use App\Services\Post\PostMediaCleanupService;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class PostPhase4Test extends TestCase
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
            'body' => 'Phase 4 reel',
            'status' => PostStatusEnum::Ready,
            'visibility' => 'public',
            'published_at' => now(),
            'ready_at' => now(),
            'duration_ms' => 12000,
            'original_path' => 'posts/videos/original/1/orig.mp4',
            'processed_path' => null,
            'thumbnail_path' => 'posts/videos/thumbs/1/poster.jpg',
            'hls_master_path' => 'posts/videos/hls/1/enc/master.m3u8',
            'playback_variants' => [
                [
                    'quality' => '720p',
                    'path' => 'posts/videos/hls/1/enc/720p/index.m3u8',
                    'type' => 'hls',
                    'bandwidth' => 2_750_000,
                ],
            ],
            'likes_count' => 0,
            'comments_count' => 0,
            'shares_count' => 0,
            'views_count' => 0,
            'reports_count' => 0,
        ], $overrides));
    }

    public function test_user_feed_exposes_hls_playback_fields(): void
    {
        $owner = User::factory()->create();
        $reel = $this->readyReel($owner);

        $this->getJson('/api/v1/reels/'.$reel->id)
            ->assertOk()
            ->assertJsonPath('data.playback.type', 'hls')
            ->assertJsonPath('data.playback.hls_url', fn ($url) => is_string($url) && str_contains($url, 'master.m3u8'))
            ->assertJsonPath('data.playback.url', fn ($url) => is_string($url) && str_contains($url, 'master.m3u8'))
            ->assertJsonPath('data.playback.is_processed', true);
    }

    public function test_delete_hard_deletes_reel_and_dispatches_media_cleanup(): void
    {
        Queue::fake();
        Storage::fake(config('filesystems.media_disk'));

        $owner = User::factory()->create(['reels_count' => 1]);
        $reel = $this->readyReel($owner);
        $reelId = $reel->id;
        $disk = Storage::disk(config('filesystems.media_disk'));
        $disk->put($reel->videoRaw('original_path'), 'orig');
        $disk->put($reel->videoRaw('hls_master_path'), '#EXTM3U');

        PostComment::query()->create([
            'post_id' => $reelId,
            'user_id' => $owner->id,
            'body' => 'bye',
        ]);

        $this->actingAs($owner, 'api')
            ->deleteJson('/api/v1/reels/'.$reelId)
            ->assertOk()
            ->assertJsonPath('type', 'SUCCESS');

        $this->assertDatabaseMissing('posts', ['id' => $reelId]);
        $this->assertDatabaseMissing('post_comments', ['post_id' => $reelId]);
        $this->assertSame(0, $owner->fresh()->reels_count);

        Queue::assertPushed(CleanupPostMediaJob::class, function ($job) use ($reelId) {
            return ($job->snapshot['post_id'] ?? null) === $reelId
                && in_array('posts/videos/original/1/orig.mp4', $job->snapshot['paths'] ?? [], true);
        });
    }

    public function test_cleanup_service_deletes_original_when_hls_ready(): void
    {
        Storage::fake(config('filesystems.media_disk'));
        $disk = Storage::disk(config('filesystems.media_disk'));

        $owner = User::factory()->create();
        $reel = $this->readyReel($owner);
        $disk->put($reel->videoRaw('original_path'), 'original-bytes');
        $disk->put($reel->videoRaw('hls_master_path'), '#EXTM3U');

        app(PostMediaCleanupService::class)->deleteOriginal($reel->fresh());

        $reel->refresh();
        $this->assertNull($reel->videoRaw('original_path'));
        $this->assertFalse($disk->exists('posts/videos/original/1/orig.mp4'));
        $this->assertTrue($disk->exists($reel->videoRaw('hls_master_path')));
    }

    public function test_purge_expired_originals_command_clears_ready_reels_with_hls(): void
    {
        Storage::fake(config('filesystems.media_disk'));
        $disk = Storage::disk(config('filesystems.media_disk'));

        $owner = User::factory()->create();
        $withHls = $this->readyReel($owner, [
            'ready_at' => now(),
            'original_path' => 'posts/videos/original/old.mp4',
            'processed_path' => null,
            'hls_master_path' => 'posts/videos/hls/old/master.m3u8',
        ]);

        $disk->put('posts/videos/original/old.mp4', 'old');
        $disk->put('posts/videos/hls/old/master.m3u8', '#EXTM3U');

        $this->artisan('posts:purge-expired-originals')
            ->assertSuccessful();

        $this->assertNull($withHls->fresh()->videoRaw('original_path'));
        $this->assertFalse($disk->exists('posts/videos/original/old.mp4'));
    }

    public function test_admin_can_list_patch_and_reprocess_reels(): void
    {
        Queue::fake();

        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $owner = User::factory()->create();
        $reel = $this->readyReel($owner);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/posts')
            ->assertOk()
            ->assertJsonPath('data.0.id', $reel->id)
            ->assertJsonPath('data.0.type', 'video')
            ->assertJsonPath('data.0.caption', 'Phase 4 reel')
            ->assertJsonPath('data.0.body', 'Phase 4 reel')
            ->assertJsonStructure([
                'data' => [
                    [
                        'playback' => ['type', 'url', 'poster_url', 'hls_url', 'is_processed'],
                        'counts' => ['likes', 'comments', 'views', 'reports', 'reposts'],
                    ],
                ],
            ]);

        $this->actingAs($admin, 'api')
            ->patchJson('/api/v1/admin/posts/'.$reel->id, [
                'visibility' => 'private',
                'status' => 'rejected',
                'caption' => 'Moderated caption',
            ])
            ->assertOk()
            ->assertJsonPath('data.visibility', 'private')
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.body', 'Moderated caption')
            ->assertJsonPath('data.caption', 'Moderated caption');

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/posts/'.$reel->id.'/reprocess')
            ->assertOk()
            ->assertJsonPath('data.status', 'processing');

        Queue::assertPushed(ExtractPostPosterJob::class, function (ExtractPostPosterJob $job) use ($reel) {
            return $job->postId === $reel->id
                && $job->forceRefine === true
                && $job->queue === config('posts.queues.poster');
        });
        Queue::assertPushed(ProcessPostVideoJob::class, function (ProcessPostVideoJob $job) use ($reel) {
            return $job->postId === $reel->id
                && $job->queue === config('posts.queues.transcode');
        });
    }

    public function test_admin_list_exposes_type_and_media_for_mixed_posts(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $owner = User::factory()->create();

        $text = Post::query()->create([
            'user_id' => $owner->id,
            'type' => PostTypeEnum::Text,
            'body' => 'Hello text moderation',
            'background_id' => 'bats',
            'status' => PostStatusEnum::Ready,
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        $image = Post::query()->create([
            'user_id' => $owner->id,
            'type' => PostTypeEnum::Image,
            'body' => 'Image post body',
            'cover_path' => 'posts/images/covers/cover.webp',
            'status' => PostStatusEnum::Ready,
            'visibility' => 'public',
            'published_at' => now(),
        ]);
        PostMedia::query()->create([
            'post_id' => $image->id,
            'kind' => 'image',
            'path' => 'posts/images/1/shot.webp',
            'sort_order' => 0,
            'width' => 1080,
            'height' => 1350,
        ]);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/posts?filter[type]=text')
            ->assertOk()
            ->assertJsonPath('data.0.id', $text->id)
            ->assertJsonPath('data.0.type', 'text')
            ->assertJsonPath('data.0.body', 'Hello text moderation')
            ->assertJsonPath('data.0.background_id', 'bats')
            ->assertJsonMissingPath('data.0.playback');

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/posts?filter[type]=image')
            ->assertOk()
            ->assertJsonPath('data.0.id', $image->id)
            ->assertJsonPath('data.0.type', 'image')
            ->assertJsonPath('data.0.media.0.url', fn ($url) => is_string($url) && str_contains($url, 'shot.webp'));

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/posts?filter[caption]=Hello text')
            ->assertOk()
            ->assertJsonPath('data.0.id', $text->id);

        $report = PostReport::query()->create([
            'post_id' => $text->id,
            'reporter_id' => $owner->id,
            'reason' => 'spam',
            'details' => 'Text spam',
            'status' => 'open',
        ]);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/post-reports?filter[status]=open')
            ->assertOk()
            ->assertJsonPath('data.0.id', $report->id)
            ->assertJsonPath('data.0.post.type', 'text')
            ->assertJsonPath('data.0.post.caption', 'Hello text moderation');
    }

    public function test_admin_can_moderate_reel_reports(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $owner = User::factory()->create();
        $reporter = User::factory()->create();
        $reel = $this->readyReel($owner, ['reports_count' => 1]);

        $report = PostReport::query()->create([
            'post_id' => $reel->id,
            'reporter_id' => $reporter->id,
            'reason' => 'spam',
            'details' => 'Looks fake',
            'status' => 'open',
        ]);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/post-reports?filter[status]=open')
            ->assertOk()
            ->assertJsonPath('data.0.id', $report->id);

        $this->actingAs($admin, 'api')
            ->patchJson('/api/v1/admin/post-reports/'.$report->id, [
                'status' => 'dismissed',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'dismissed');
    }

    public function test_cleanup_original_job_runs(): void
    {
        Storage::fake(config('filesystems.media_disk'));
        $disk = Storage::disk(config('filesystems.media_disk'));

        $owner = User::factory()->create();
        $reel = $this->readyReel($owner);
        $disk->put($reel->videoRaw('original_path'), 'bytes');
        $disk->put($reel->videoRaw('hls_master_path'), '#EXTM3U');

        (new CleanupPostOriginalJob($reel->id))->handle(app(PostMediaCleanupService::class));

        $this->assertNull($reel->fresh()->videoRaw('original_path'));
    }
}
