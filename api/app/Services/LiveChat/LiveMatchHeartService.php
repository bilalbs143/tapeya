<?php

namespace App\Services\LiveChat;

use App\Events\Broadcast\MatchHeartReceived;
use App\Models\TournamentMatch;
use Illuminate\Support\Facades\Redis;

class LiveMatchHeartService
{
    public function send(TournamentMatch $match, int $userId): void
    {
        $stream = $match->stream;
        if (! $stream || ! in_array($stream->status, ['live', 'starting'], true)) {
            abort(422, 'This match does not have an active stream.');
        }

        // Throttle: one heart broadcast per user every 2 seconds
        $key = 'live_heart:'.$match->id.':'.$userId;
        $set = Redis::set($key, '1', 'NX', 'EX', 2);

        if ($set === null || $set === false) {
            return; // silently drop — client already shows local hearts
        }

        MatchHeartReceived::dispatch(matchId: $match->id);
    }
}
