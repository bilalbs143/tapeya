<?php

namespace App\Support\LiveChat;

use Illuminate\Support\Facades\Redis;

final class LiveChatRedisKeys
{
    public static function interval(int $matchId, int|string $userId): string
    {
        return "chat:{$matchId}:interval:{$userId}";
    }

    public static function burst(int $matchId, int|string $userId): string
    {
        return "chat:{$matchId}:burst:{$userId}";
    }

    public static function dedup(int $matchId, int|string $userId): string
    {
        return "chat:{$matchId}:dedup:{$userId}";
    }

    public static function mute(int $matchId, int|string $userId): string
    {
        return "chat:{$matchId}:mute:{$userId}";
    }

    /**
     * Purge all chat operational keys for a match when the stream ends.
     */
    public static function purgeMatch(int $matchId): void
    {
        $pattern = self::matchPattern($matchId);
        $cursor = 0;

        do {
            [$cursor, $keys] = Redis::scan($cursor, [
                'match' => $pattern,
                'count' => 100,
            ]);

            if (! empty($keys)) {
                Redis::del(...$keys);
            }
        } while ($cursor !== 0);
    }

    public static function matchPattern(int $matchId): string
    {
        return "chat:{$matchId}:*";
    }
}
