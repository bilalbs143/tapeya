<?php

namespace App\Services\LiveChat;

use App\Events\Broadcast\MatchHeartReceived;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;

class LiveMatchHeartService
{
    public function send(TournamentMatch $match, User $user): void
    {
        $stream = $match->stream;
        if (! $stream || ! in_array($stream->status, ['live', 'starting'], true)) {
            abort(422, 'This match does not have an active stream.');
        }

        // Throttle: one heart broadcast per user every 2 seconds
        $key = 'live_heart:' . $match->id . ':' . $user->id;
        $set = Redis::set($key, '1', 'NX', 'EX', 2);

        if ($set === null || $set === false) {
            return; // silently drop — client already shows local hearts
        }

        MatchHeartReceived::dispatch(
            matchId: $match->id,
            userId: (int) $user->id,
            avatarUrl: $this->avatarUrl($user),
            initials: $this->initials($user),
        );
    }

    private function avatarUrl(User $user): ?string
    {
        if (! $user->avatar) {
            return null;
        }

        return Storage::disk(config('filesystems.media_disk'))->url($user->avatar);
    }

    private function initials(User $user): string
    {
        if ($user->nickname) {
            return mb_strtoupper(mb_substr($user->nickname, 0, 2));
        }

        $name = trim($user->name ?? '');
        $parts = preg_split('/\s+/', $name, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        if (count($parts) >= 2) {
            return mb_strtoupper(mb_substr($parts[0], 0, 1) . mb_substr($parts[count($parts) - 1], 0, 1));
        }

        return mb_strtoupper(mb_substr($name !== '' ? $name : 'U', 0, 2));
    }
}
