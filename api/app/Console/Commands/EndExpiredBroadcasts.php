<?php

namespace App\Console\Commands;

use App\Models\LiveStream;
use App\Streaming\LiveStreamService;
use Illuminate\Console\Command;

/**
 * Self-serve mobile broadcasts only — two distinct failure modes, two distinct cleanups.
 * See LIVE_STREAM_MOBILE_BROADCAST.md's "Auto-end enforcement" section.
 */
class EndExpiredBroadcasts extends Command
{
    protected $signature = 'broadcasts:end-expired';

    protected $description = 'End or delete self-serve mobile broadcasts that exceeded their time budget';

    public function handle(LiveStreamService $service): int
    {
        // Case 1: actually went live, past the fixed cap — end it (keeps the VOD and chat
        // history, exactly like a broadcaster tapping "End Broadcast" themselves).
        LiveStream::query()
            ->whereNotNull('owner_user_id')
            ->whereNotNull('started_at')
            ->where('started_at', '<=', now()->subSeconds(LiveStreamService::SELF_SERVE_MAX_DURATION_SECONDS))
            ->whereIn('status', ['starting', 'live'])
            ->lazy()
            ->each(fn (LiveStream $stream) => $service->end($stream));

        // Case 2: created but never actually went live. delete(), not end() — a broadcast
        // that never connected has no VOD or chat history worth keeping, and end() would call
        // YouTubeStreamProvider::endStream()'s transition('complete', ...) on a broadcast that
        // was never live, which can error and still leaves an empty draft video on the channel.
        // Without this cleanup the row also permanently occupies the user's one-active-broadcast
        // slot. assertNoActiveSelfServeStream() runs this identical cleanup eagerly (no 30-minute
        // wait) whenever the owner tries to go live again — this sweep is the backstop for a row
        // that's simply abandoned and never revisited.
        LiveStream::query()
            ->whereNotNull('owner_user_id')
            ->whereNull('started_at')
            ->where('created_at', '<=', now()->subMinutes(30))
            ->whereIn('status', ['idle', 'starting'])
            ->lazy()
            ->each(fn (LiveStream $stream) => $service->delete($stream));

        return self::SUCCESS;
    }
}
