<?php

namespace Tests\Feature\Post;

use App\Enums\Post\PostStatusEnum;
use App\Models\User;
use App\Support\Media\MediaDisk;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class ReelThumbnailUploadTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    public function test_reel_thumbnail_upload_stores_webp_under_thumbs_dir(): void
    {
        Storage::fake(MediaDisk::name());

        $owner = User::factory()->create();
        $post = $this->makeVideoPost($owner, [
            'status' => PostStatusEnum::Uploading,
            'published_at' => null,
            'thumbnail_path' => null,
        ]);

        $file = UploadedFile::fake()->image('client-poster.jpg', 720, 1280);

        $response = $this->actingAs($owner, 'api')
            ->post('/api/v1/media/reel/'.$post->id.'/thumbnail', [
                'file' => $file,
            ])
            ->assertOk();

        $post->refresh();
        $thumb = $post->videoRaw('thumbnail_path');

        $this->assertNotNull($thumb);
        $this->assertStringStartsWith('posts/videos/thumbs/'.$post->id.'/', $thumb);
        $this->assertStringEndsWith('.webp', $thumb);
        $this->assertSame($thumb, $post->getRawOriginal('cover_path'));
        Storage::disk(MediaDisk::name())->assertExists($thumb);
        $response->assertJsonPath('data.url', MediaDisk::url($thumb));
    }

    public function test_late_thumbnail_does_not_overwrite_after_original_lands(): void
    {
        Storage::fake(MediaDisk::name());

        $owner = User::factory()->create();
        $serverPoster = 'posts/videos/thumbs/server-poster.webp';
        Storage::disk(MediaDisk::name())->put($serverPoster, 'webp-bytes');

        $post = $this->makeVideoPost($owner, [
            'status' => PostStatusEnum::Processing,
            'published_at' => now(),
            'original_path' => 'posts/videos/original/1/a.mp4',
            'thumbnail_path' => $serverPoster,
        ]);
        $post->forceFill(['cover_path' => $serverPoster])->save();
        Storage::disk(MediaDisk::name())->put($post->videoRaw('original_path'), 'fake-video');

        $this->actingAs($owner, 'api')
            ->post('/api/v1/media/reel/'.$post->id.'/thumbnail', [
                'file' => UploadedFile::fake()->image('late-client.jpg', 320, 320),
            ])
            ->assertOk()
            ->assertJsonPath('data.url', MediaDisk::url($serverPoster));

        $post->refresh();
        $this->assertSame($serverPoster, $post->videoRaw('thumbnail_path'));
        $this->assertSame($serverPoster, $post->getRawOriginal('cover_path'));
    }
}
