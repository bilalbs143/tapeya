<?php

namespace App\Console\Commands;

use App\Models\MatchStream;
use App\Streaming\MatchStreamService;
use App\Streaming\StreamProviderResolver;
use Illuminate\Console\Command;

class SyncStreamStatuses extends Command
{
    protected $signature = 'streams:sync';

    protected $description = 'Poll providers to sync stream statuses';

    public function handle(MatchStreamService $service, StreamProviderResolver $resolver): int
    {
        MatchStream::query()
            ->whereNotIn('status', ['ended', 'error'])
            ->whereNotNull('provider_stream_id')
            ->with('match.tournament')
            ->get()
            ->each(function (MatchStream $stream) use ($service, $resolver) {
                if ($resolver->forMatch($stream->match)->supportsWebhooks()) {
                    return;
                }

                $service->syncStatus($stream->match);
            });

        return self::SUCCESS;
    }
}
