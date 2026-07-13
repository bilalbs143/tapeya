<?php

namespace Tests\Support\Streaming;

use App\Models\MatchStream;
use App\Streaming\Contracts\StreamProviderContract;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\Data\StreamIngestConfig;
use App\Streaming\Data\StreamPlayback;
use Illuminate\Support\Collection;

/**
 * Test double for the YouTube driver — avoids real Google API calls in feature tests
 * that exercise the match-linked stream lifecycle (create/end/delete/sync).
 */
class FakeStreamProvider implements StreamProviderContract
{
    /** Captured for assertions — e.g. confirming self-serve always passes privacy: 'unlisted'. */
    public ?CreateStreamData $lastCreateData = null;

    public function createStream(MatchStream $stream, CreateStreamData $data): void
    {
        $this->lastCreateData = $data;

        $stream->update([
            'provider_stream_id' => 'fake-broadcast-id',
            'provider_ingest_id' => 'fake-ingest-id',
            'provider_playback_id' => 'fake-broadcast-id',
            'ingest_rtmp_url' => 'rtmp://fake.example.com/live',
            'embed_url' => 'https://www.youtube.com/embed/fake-broadcast-id',
            'status' => 'idle',
        ]);
    }

    public function syncStatus(MatchStream $stream): void
    {
        $stream->update(['status' => 'live']);
    }

    /**
     * @param  Collection<int, MatchStream>  $streams
     */
    public function syncStatuses(Collection $streams): void
    {
        $streams->each(fn (MatchStream $stream) => $this->syncStatus($stream));
    }

    public function endStream(MatchStream $stream): void
    {
        $stream->update(['status' => 'ended', 'ended_at' => now()]);
    }

    public function deleteStream(MatchStream $stream): void
    {
        // no-op — nothing to clean up remotely in tests
    }

    public function playback(MatchStream $stream): StreamPlayback
    {
        return new StreamPlayback(
            mode: 'iframe',
            url: null,
            embedId: $stream->provider_playback_id,
            embedUrl: $stream->embed_url,
        );
    }

    public function ingestConfig(MatchStream $stream): StreamIngestConfig
    {
        return new StreamIngestConfig(
            rtmpUrl: 'rtmp://fake.example.com/live',
            streamKey: 'fake-key',
            backupRtmpUrl: null,
        );
    }

    public function slug(): string
    {
        return 'youtube';
    }

    public function supportsWebhooks(): bool
    {
        return false;
    }
}
