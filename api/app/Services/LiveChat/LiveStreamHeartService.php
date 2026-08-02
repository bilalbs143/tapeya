<?php

namespace App\Services\LiveChat;

use App\Events\Broadcast\LiveStreamHeartReceived;
use App\Models\MatchStream;
use App\Models\User;
use App\Support\LiveChat\LiveChatRedisKeys;
use App\Support\Media\MediaDisk;
use Illuminate\Support\Facades\Redis;

class LiveStreamHeartService
{
    public function send(MatchStream $stream, User $user): void
    {
        if (! in_array($stream->status, ['live', 'starting'], true)) {
            abort(422, 'This stream is not active.');
        }

        $key = LiveChatRedisKeys::heartThrottle($stream->id, $user->id);
        $set = Redis::set($key, '1', 'NX', 'EX', 2);

        if ($set === null || $set === false) {
            return;
        }

        LiveStreamHeartReceived::dispatch(
            streamId: $stream->id,
            userId: (int) $user->id,
            avatarUrl: $this->avatarUrl($user),
            initials: $this->initials($user),
        );
    }

    private function avatarUrl(User $user): ?string
    {
        return MediaDisk::url($user->avatar);
    }

    private function initials(User $user): string
    {
        if ($user->nickname) {
            return mb_strtoupper(mb_substr($user->nickname, 0, 2));
        }

        $name = trim($user->name ?? '');
        $parts = preg_split('/\s+/', $name, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        if (count($parts) >= 2) {
            return mb_strtoupper(mb_substr($parts[0], 0, 1).mb_substr($parts[count($parts) - 1], 0, 1));
        }

        return mb_strtoupper(mb_substr($name !== '' ? $name : 'U', 0, 2));
    }
}
