<?php

namespace App\Support\LiveChat;

use Illuminate\Support\Facades\Redis;

final class LiveChatRedisKeys
{
    public static function intervalForStream(int $streamId, int|string $userId): string
    {
        return "chat:stream:{$streamId}:interval:{$userId}";
    }

    public static function burstForStream(int $streamId, int|string $userId): string
    {
        return "chat:stream:{$streamId}:burst:{$userId}";
    }

    public static function dedupForStream(int $streamId, int|string $userId): string
    {
        return "chat:stream:{$streamId}:dedup:{$userId}";
    }

    public static function muteForStream(int $streamId, int|string $userId): string
    {
        return "chat:stream:{$streamId}:mute:{$userId}";
    }

    public static function heartThrottle(int $streamId, int|string $userId): string
    {
        return "live_heart:stream:{$streamId}:{$userId}";
    }

    /**
     * Purge all chat operational keys for a stream when it ends.
     */
    public static function purgeStream(int $streamId): void
    {
        self::purgeByPattern(self::streamPattern($streamId));
    }

    public static function streamPattern(int $streamId): string
    {
        return "chat:stream:{$streamId}:*";
    }

    private static function purgeByPattern(string $pattern): void
    {
        $cursor = '0';

        do {
            [$cursor, $keys] = Redis::scan($cursor, [
                'match' => $pattern,
                'count' => 100,
            ]);

            $cursor = (string) ($cursor ?? '0');

            if (! empty($keys)) {
                Redis::del(...$keys);
            }
        } while ($cursor !== '0');
    }
}
