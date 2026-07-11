<?php

namespace App\Support\LiveChat;

use Illuminate\Support\Facades\Log;
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
        self::purgeByPattern(self::heartPattern($streamId));
    }

    public static function streamPattern(int $streamId): string
    {
        return "chat:stream:{$streamId}:*";
    }

    public static function heartPattern(int $streamId): string
    {
        return "live_heart:stream:{$streamId}:*";
    }

    private static function purgeByPattern(string $pattern): void
    {
        try {
            $cursor = null;
            $iterations = 0;
            // Cap iterations so a stuck SCAN cannot run unbounded.
            $maxIterations = 50;

            do {
                $result = Redis::scan($cursor ?? 0, [
                    'match' => $pattern,
                    'count' => 100,
                ]);

                // Laravel phpredis returns false when the scan is finished with no keys.
                if ($result === false) {
                    break;
                }

                [$cursor, $keys] = $result;
                $cursor = $cursor === null || $cursor === false ? 0 : $cursor;

                if (! empty($keys)) {
                    Redis::del(...$keys);
                }

                $iterations++;
            } while ((int) $cursor !== 0 && $iterations < $maxIterations);

            if ((int) $cursor !== 0) {
                Log::warning('Live chat Redis purge stopped early (SCAN did not finish)', [
                    'pattern' => $pattern,
                    'iterations' => $iterations,
                    'cursor' => $cursor,
                ]);
            }
        } catch (\Throwable $e) {
            // Ending a broadcast must not fatal on Redis — keys expire via TTL anyway.
            Log::warning('Live chat Redis purge failed: '.$e->getMessage(), [
                'pattern' => $pattern,
            ]);
        }
    }
}
