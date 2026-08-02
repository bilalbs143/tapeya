<?php

namespace Tests\Unit\Services\Post;

use App\Enums\Post\PostStatusEnum;
use App\Models\User;
use App\Services\Post\PostTranscodeService;
use App\Support\Media\MediaDisk;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class PostTranscodeAbrResumeTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    public function test_needs_abr_completion_when_ready_incomplete_and_original_exists(): void
    {
        Storage::fake(MediaDisk::name());

        $user = User::factory()->create();
        $original = 'posts/videos/original/1/src.mp4';
        MediaDisk::put($original, 'fake-bytes');

        $post = $this->makeVideoPost($user, [
            'status' => PostStatusEnum::Ready,
            'original_path' => $original,
            'processed_path' => null,
            'hls_master_path' => 'posts/videos/hls/1/enc/master.m3u8',
            'playback_variants' => [
                [
                    'quality' => '480p',
                    'path' => 'posts/videos/hls/1/enc/480p/index.m3u8',
                    'type' => 'hls',
                    'bandwidth' => 1_320_000,
                ],
            ],
            'abr_complete' => false,
            'ready_at' => now(),
        ]);

        $service = app(PostTranscodeService::class);
        $this->assertTrue($service->needsAbrCompletion($post));
    }

    public function test_needs_abr_completion_false_when_abr_complete(): void
    {
        Storage::fake(MediaDisk::name());

        $user = User::factory()->create();
        $original = 'posts/videos/original/2/src.mp4';
        MediaDisk::put($original, 'fake-bytes');

        $post = $this->makeVideoPost($user, [
            'status' => PostStatusEnum::Ready,
            'original_path' => $original,
            'processed_path' => null,
            'hls_master_path' => 'posts/videos/hls/2/enc/master.m3u8',
            'abr_complete' => true,
            'ready_at' => now(),
        ]);

        $this->assertFalse(app(PostTranscodeService::class)->needsAbrCompletion($post));
    }
}
