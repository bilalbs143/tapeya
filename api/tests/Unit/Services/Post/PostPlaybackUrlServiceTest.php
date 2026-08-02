<?php

namespace Tests\Unit\Services\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostVisibilityEnum;
use App\Models\User;
use App\Services\Post\PostPlaybackUrlService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class PostPlaybackUrlServiceTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    public function test_hls_playback_urls_are_permanent_without_signature_query(): void
    {
        Storage::fake(config('filesystems.media_disk'));

        $owner = User::factory()->create();
        $post = $this->makeVideoPost($owner, [
            'visibility' => PostVisibilityEnum::Followers,
            'status' => PostStatusEnum::Ready,
            'published_at' => now(),
            'thumbnail_path' => 'posts/videos/thumbs/1/clip.webp',
            'hls_master_path' => 'posts/videos/hls/1/master.m3u8',
        ]);

        $service = app(PostPlaybackUrlService::class);
        $payload = $service->playbackPayload($post, $owner->id);

        foreach ([$payload['url'], $payload['hls_url'], $service->posterUrl($post)] as $url) {
            $this->assertIsString($url);
            $this->assertStringContainsString('posts/videos/', $url);
            $this->assertStringNotContainsString('X-Amz-', $url);
            $query = parse_url($url, PHP_URL_QUERY);
            $this->assertTrue($query === null || $query === '', 'Playback URL must not be signed: '.$url);
        }

        $this->assertSame('hls', $payload['type']);
        $this->assertTrue($payload['is_processed']);
        $this->assertSame($payload['hls_url'], $payload['url']);
    }

    public function test_owner_gets_original_while_processing_without_hls(): void
    {
        Storage::fake(config('filesystems.media_disk'));

        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $post = $this->makeVideoPost($owner, [
            'status' => PostStatusEnum::Processing,
            'original_path' => 'posts/videos/original/1/src.mp4',
            'hls_master_path' => null,
            'thumbnail_path' => 'posts/videos/thumbs/1/clip.webp',
        ]);

        $service = app(PostPlaybackUrlService::class);

        $ownerPayload = $service->playbackPayload($post, $owner->id);
        $this->assertSame('original', $ownerPayload['type']);
        $this->assertFalse($ownerPayload['is_processed']);
        $this->assertNull($ownerPayload['hls_url']);
        $this->assertStringContainsString('original', (string) $ownerPayload['url']);

        $strangerPayload = $service->playbackPayload($post, $stranger->id);
        $this->assertNull($strangerPayload['url']);
        $this->assertNull($strangerPayload['hls_url']);
        $this->assertFalse($strangerPayload['is_processed']);

        $guestPayload = $service->playbackPayload($post, null);
        $this->assertNull($guestPayload['url']);
    }

    public function test_hls_wins_over_original_once_ready(): void
    {
        Storage::fake(config('filesystems.media_disk'));

        $owner = User::factory()->create();
        $post = $this->makeVideoPost($owner, [
            'status' => PostStatusEnum::Ready,
            'original_path' => 'posts/videos/original/1/src.mp4',
            'hls_master_path' => 'posts/videos/hls/1/enc/master.m3u8',
        ]);

        $payload = app(PostPlaybackUrlService::class)->playbackPayload($post, $owner->id);

        $this->assertSame('hls', $payload['type']);
        $this->assertTrue($payload['is_processed']);
        $this->assertStringContainsString('master.m3u8', (string) $payload['url']);
    }
}
