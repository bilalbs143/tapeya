<?php

namespace Tests\Unit\Streaming;

use App\Models\MatchStream;
use App\Streaming\Support\StreamUrlPlayback;
use Tests\TestCase;

class StreamUrlPlaybackTest extends TestCase
{
    public function test_resolve_youtube_watch_url(): void
    {
        $playback = StreamUrlPlayback::resolve('https://www.youtube.com/watch?v=abc123XYZ');

        $this->assertSame('iframe', $playback['mode']);
        $this->assertSame('abc123XYZ', $playback['embed_id']);
        $this->assertStringContainsString('abc123XYZ', $playback['embed_url']);
    }

    public function test_resolve_hls_url(): void
    {
        $url = 'https://cdn.example.com/live/playlist.m3u8';
        $playback = StreamUrlPlayback::resolve($url);

        $this->assertSame('hls', $playback['mode']);
        $this->assertSame($url, $playback['url']);
    }

    public function test_playback_for_app_on_standalone_stream(): void
    {
        $stream = new MatchStream([
            'match_id' => null,
            'streaming_url' => 'https://www.youtube.com/watch?v=testvid12',
            'status' => 'live',
        ]);

        $playback = $stream->playbackForApp();

        $this->assertNotNull($playback);
        $this->assertSame('iframe', $playback['mode']);
        $this->assertSame('testvid12', $playback['embed_id']);
    }
}
