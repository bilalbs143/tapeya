<?php

namespace Tests\Unit\Streaming;

use App\Models\LiveStream;
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

    public function test_resolve_facebook_watch_live_url(): void
    {
        $url = 'https://www.facebook.com/watch/live/?mibextid=wwXIfr&ref=watch_permalink&v=1578076810638752&rdid=s84e56Yp5UqVq2N3';
        $playback = StreamUrlPlayback::resolve($url);

        $this->assertSame('iframe', $playback['mode']);
        $this->assertSame('facebook', $playback['provider']);
        $this->assertStringStartsWith('https://www.facebook.com/plugins/video.php?', $playback['embed_url']);
        $this->assertStringContainsString(rawurlencode('https://www.facebook.com/watch/?v=1578076810638752'), $playback['embed_url']);
    }

    public function test_resolve_facebook_share_v_url(): void
    {
        $url = 'https://www.facebook.com/share/v/1EthobuGMr/?mibextid=wwXIfr';
        $playback = StreamUrlPlayback::resolve($url);

        $this->assertSame('iframe', $playback['mode']);
        $this->assertSame('facebook', $playback['provider']);
        $this->assertStringStartsWith('https://www.facebook.com/plugins/video.php?', $playback['embed_url']);
        $this->assertStringContainsString(rawurlencode('https://www.facebook.com/share/v/1EthobuGMr'), $playback['embed_url']);
    }

    public function test_resolve_facebook_page_video_url(): void
    {
        $url = 'https://www.facebook.com/RaiMudasirAlii/videos/1638854447583237';
        $playback = StreamUrlPlayback::resolve($url);

        $this->assertSame('iframe', $playback['mode']);
        $this->assertSame('facebook', $playback['provider']);
        $this->assertStringStartsWith('https://www.facebook.com/plugins/video.php?', $playback['embed_url']);
        $this->assertStringContainsString(
            rawurlencode('https://www.facebook.com/RaiMudasirAlii/videos/1638854447583237'),
            $playback['embed_url']
        );
    }

    public function test_playback_for_app_on_standalone_stream(): void
    {
        $stream = new LiveStream([
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
