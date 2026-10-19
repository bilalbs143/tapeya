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
     *
     * Fresh creates stay out of the poll until staff/manual Sync (or owner Start) has
     * taken them live: idle + never started wastes YouTube quota every minute.
     * Once live/starting (or started_at set — reconnect/idle grace), auto-sync continues.
     * Admin "Sync Status" still calls LiveStreamService::syncStatus() for any row.
     */
    public function handle(LiveStreamService $service, StreamProviderResolver $resolver): int
    {
        LiveStream::query()
            ->whereNotIn('status', ['ended', 'error'])
            ->whereNotNull('provider_stream_id')
            ->where('provider', '!=', 'external')
            ->where(function ($query) {
                $query->whereIn('status', ['live', 'starting'])
                    ->orWhereNotNull('started_at');
            })
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
