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

    public function test_resolve_facebook_page_video_url(): void
    {
        $playback = StreamUrlPlayback::resolve('https://www.facebook.com/PakistanCricketBoard/videos/1388154923463052');

        $this->assertSame('iframe', $playback['mode']);
        $this->assertSame('facebook', $playback['provider']);
        $this->assertStringStartsWith('https://www.facebook.com/plugins/video.php?', $playback['embed_url']);
        $this->assertStringContainsString(rawurlencode('https://www.facebook.com/watch/?v=1388154923463052'), $playback['embed_url']);
        // Facebook's plugin only renders its fullscreen/expand control near this size.
        $this->assertStringContainsString('width=1280', $playback['embed_url']);
        $this->assertStringContainsString('height=720', $playback['embed_url']);
    }

    public function test_resolve_facebook_watch_live_url(): void
    {
        $url = 'https://web.facebook.com/100084369563623/videos/2292292598197539';
        $playback = StreamUrlPlayback::resolve($url);

        $this->assertSame('iframe', $playback['mode']);
        $this->assertSame('facebook', $playback['provider']);
        $this->assertStringContainsString(rawurlencode('https://www.facebook.com/watch/?v=2292292598197539'), $playback['embed_url']);
    }

    public function test_resolve_hls_url(): void
    {
        $url = 'https://cdn.example.com/live/playlist.m3u8';
        $playback = StreamUrlPlayback::resolve($url);

        $this->assertSame('hls', $playback['mode']);
        $this->assertSame($url, $playback['url']);
    }

    public function test_resolve_generic_https_iframe_url(): void
    {
        $url = 'https://example.com/player/live';
        $playback = StreamUrlPlayback::resolve($url);

        $this->assertSame('iframe', $playback['mode']);
        $this->assertSame($url, $playback['embed_url']);
        $this->assertArrayNotHasKey('provider', $playback);
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
