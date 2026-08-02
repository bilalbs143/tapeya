<?php

namespace Tests\Unit\Support\Post;

use App\Support\Post\PostAbrLadder;
use PHPUnit\Framework\TestCase;

class PostAbrLadderTest extends TestCase
{
    public function test_rungs_skip_taller_than_source(): void
    {
        $rungs = PostAbrLadder::rungsForSource([
            ['height' => 360, 'maxrate' => '800k', 'bufsize' => '1600k', 'audio_bitrate' => '96k', 'crf' => 26],
            ['height' => 720, 'maxrate' => '2500k', 'bufsize' => '5000k', 'audio_bitrate' => '128k', 'crf' => 23],
        ], 400);

        $heights = array_column($rungs, 'height');
        $this->assertSame([360], $heights);
        $this->assertSame(PostAbrLadder::estimateBandwidth('800k', '96k'), $rungs[0]['bandwidth']);
    }

    public function test_rungs_include_720_when_source_is_tall_enough(): void
    {
        $rungs = PostAbrLadder::rungsForSource([
            ['height' => 360, 'maxrate' => '800k', 'bufsize' => '1600k', 'audio_bitrate' => '96k', 'crf' => 26],
            ['height' => 720, 'maxrate' => '2500k', 'bufsize' => '5000k', 'audio_bitrate' => '128k', 'crf' => 23],
        ], 720);

        $this->assertSame([360, 720], array_column($rungs, 'height'));
    }

    public function test_estimate_bandwidth_adds_audio_and_overhead(): void
    {
        // 800k video + 96k audio = 896000 → *1.10 ≈ 985600
        $this->assertSame(985_600, PostAbrLadder::estimateBandwidth('800k', '96k'));
    }

    public function test_master_playlist_lists_bandwidth_and_resolution(): void
    {
        $body = PostAbrLadder::masterPlaylist([
            ['height' => 360, 'width' => 640, 'bandwidth' => 800_000, 'playlist' => '360p/index.m3u8'],
            ['height' => 720, 'width' => 1280, 'bandwidth' => 2_800_000, 'playlist' => '720p/index.m3u8'],
        ]);

        $this->assertStringContainsString('#EXTM3U', $body);
        $this->assertStringContainsString('BANDWIDTH=800000,RESOLUTION=640x360', $body);
        $this->assertStringContainsString('360p/index.m3u8', $body);
        $this->assertStringContainsString('720p/index.m3u8', $body);
    }
}
