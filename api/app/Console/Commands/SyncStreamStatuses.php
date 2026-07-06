<?php

namespace App\Console\Commands;

use App\Models\MatchStream;
use App\Streaming\LiveStreamService;
use App\Streaming\StreamProviderResolver;
use Illuminate\Console\Command;

class SyncStreamStatuses extends Command
{
    protected $signature = 'streams:sync';

    protected $description = 'Poll providers to sync stream statuses';

    public function handle(LiveStreamService $service, StreamProviderResolver $resolver): int
    {
        MatchStream::query()
            ->whereNotIn('status', ['ended', 'error'])
            ->whereNotNull('provider_stream_id')
            ->with('match.tournament')
            ->lazy()
            ->each(function (MatchStream $stream) use ($service, $resolver) {
                if ($stream->provider === 'external') {
                    return;
                }

                if ($resolver->forStream($stream)->supportsWebhooks()) {
                    return;
                }

                $service->syncStatus($stream);
            });

        return self::SUCCESS;
    }
}
