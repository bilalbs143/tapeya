<?php

namespace Tests\Unit\Services\Drama;

use App\Enums\Drama\DramaVideoSourceEnum;
use App\Models\DramaEpisode;
use App\Models\DramaSerial;
use App\Services\Drama\DramaEpisodeVideoOptimizeService;
use App\Support\Media\MediaDisk;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DramaEpisodeVideoOptimizeServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_skips_youtube_episodes(): void
    {
        Storage::fake(MediaDisk::name());

        $serial = DramaSerial::query()->create([
            'title' => 'Serial',
            'provider' => 'Tapeya',
            'is_active' => true,
            'episodes_count' => 0,
        ]);

        $episode = DramaEpisode::query()->create([
            'drama_serial_id' => $serial->id,
            'episode_number' => 1,
            'title' => 'Ep 1',
            'video_source' => DramaVideoSourceEnum::YOUTUBE,
            'video' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'is_active' => true,
        ]);

        $optimized = app(DramaEpisodeVideoOptimizeService::class)->optimize($episode);

        $this->assertFalse($optimized);
        $this->assertSame('https://www.youtube.com/embed/dQw4w9WgXcQ', $episode->fresh()->getRawOriginal('video'));
    }

    public function test_skips_when_upload_file_missing(): void
    {
        Storage::fake(MediaDisk::name());

        $serial = DramaSerial::query()->create([
            'title' => 'Serial',
            'provider' => 'Tapeya',
            'is_active' => true,
            'episodes_count' => 0,
        ]);

        $episode = DramaEpisode::query()->create([
            'drama_serial_id' => $serial->id,
            'episode_number' => 1,
            'title' => 'Ep 1',
            'video_source' => DramaVideoSourceEnum::UPLOAD,
            'video' => 'drama-episodes/videos/missing.mp4',
            'is_active' => true,
        ]);

        $optimized = app(DramaEpisodeVideoOptimizeService::class)->optimize($episode);

        $this->assertFalse($optimized);
    }
}
