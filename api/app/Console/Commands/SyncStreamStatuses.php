<?php

namespace App\Console\Commands;

use App\Models\LiveStream;
use App\Streaming\LiveStreamService;
use App\Streaming\StreamProviderResolver;
use Illuminate\Console\Command;

class SyncStreamStatuses extends Command
{
    protected $signature = 'streams:sync';

    protected $description = 'Poll providers to sync stream statuses';

    /**
     * Chunked (not lazy/per-row) on purpose: each chunk is handed to the service as a batch,
     * so YouTube (and any future batching-capable provider) can poll many streams per API call
     * instead of one round-trip per stream — see LiveStreamService::syncStatuses() /
     * YouTubeStreamProvider::syncStatuses(). 50 matches YouTube's per-request `id` limit.
     */
    public function handle(LiveStreamService $service, StreamProviderResolver $resolver): int
    {
        LiveStream::query()
            ->whereNotIn('status', ['ended', 'error'])
            ->whereNotNull('provider_stream_id')
            ->where('provider', '!=', 'external')
            ->with('match.tournament')
            ->orderBy('id')
            ->chunk(50, function ($streams) use ($service, $resolver) {
                $pollable = $streams->reject(
                    fn (LiveStream $stream) => $resolver->forStream($stream)->supportsWebhooks()
                );

                if ($pollable->isNotEmpty()) {
                    $service->syncStatuses($pollable);
                }
            });

        return self::SUCCESS;
    }
}
