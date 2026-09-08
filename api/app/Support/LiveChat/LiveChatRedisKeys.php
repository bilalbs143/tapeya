<?php

namespace App\Support\LiveChat;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

final class LiveChatRedisKeys
{
    /** Trailing comment history cap (matches frontend MAX_MESSAGES). */
    public const LOG_MAX_LENGTH = 100;

    /** Safety-net TTL; primary cleanup is purgeStream() on end. */
    public const LOG_TTL_SECONDS = 86400;

    public static function commentLog(int $streamId): string
    {
        return "chat:stream:{$streamId}:log";
    }

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
            // SCAN MATCH sees server keys (already prefixed); del() re-applies the prefix.
            $prefix = (string) config('database.redis.options.prefix', '');

            $cursor = null;
            $iterations = 0;
            $maxIterations = 50;

            do {
                // phpredis 6.x: first cursor must be null (literal 0 means "done").
                $result = Redis::scan($cursor, [
                    'match' => $prefix.$pattern,
                    'count' => 100,
                ]);

                if ($result === false) {
                    break;
                }

                [$cursor, $keys] = $result;
                $cursor = $cursor === null || $cursor === false ? 0 : $cursor;

                if (! empty($keys)) {
                    $keys = $prefix === ''
                        ? $keys
                        : array_map(
                            fn (string $key) => str_starts_with($key, $prefix) ? substr($key, strlen($prefix)) : $key,
                            $keys,
                        );

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
            Log::warning('Live chat Redis purge failed: '.$e->getMessage(), [
                'pattern' => $pattern,
            ]);
        }
    }
}
