<?php

namespace App\Jobs;

use App\Models\LiveStream;
use App\Streaming\LiveStreamService;
use App\Streaming\StreamProviderManager;
use App\Support\LiveChat\LiveChatRedisKeys;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

/**
 * Background finalize after a stream is marked ended: chat Redis purge, hub/status
 * events, and provider complete (YouTube). Kept off the HTTP request thread.
 */
class FinalizeEndedBroadcastJob implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** YouTube + Redis must not hold a worker forever. */
    public int $timeout = 90;

    public int $uniqueFor = 120;

    public function __construct(
        public int $streamId,
        public bool $notifyClients = true,
    ) {}

    public function uniqueId(): string
    {
        return 'finalize-ended-broadcast:'.$this->streamId;
    }

    public function handle(LiveStreamService $liveStreams, StreamProviderManager $providers): void
    {
        $stream = LiveStream::query()->find($this->streamId);
        if (! $stream) {
            return;
        }

        try {
            LiveChatRedisKeys::purgeStream($stream->id);
        } catch (\Throwable $e) {
            Log::warning("Live-chat purge failed for stream {$stream->id}: ".$e->getMessage());
        }

        if ($this->notifyClients) {
            try {
                $liveStreams->broadcastStatusChange($stream->fresh() ?? $stream, 'ended', null);
            } catch (\Throwable $e) {
                Log::warning("End status broadcast failed for stream {$stream->id}: ".$e->getMessage());
            }
        }

        if ($stream->provider === 'external' || ! $stream->provider_stream_id) {
            return;
        }

        try {
            $providers->driver($stream->provider)->endStream($stream->fresh() ?? $stream);
        } catch (\Throwable $e) {
            Log::warning("Provider end failed for stream {$stream->id}: ".$e->getMessage());

            throw $e;
        }
    }
}
