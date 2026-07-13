<?php

namespace App\Streaming\Support;

use Illuminate\Support\Facades\Cache;

/**
 * Tracks approximate daily YouTube Data API v3 quota usage so
 * `MonitorBroadcastOperations` can warn staff before the channel runs dry.
 *
 * Costs below are Google's documented per-call unit prices. `list` calls are
 * charged as 1 unit regardless of `part` here — a slight undercount for parts
 * that pull extra sub-resources, close enough for an early-warning threshold.
 */
final class YouTubeQuotaTracker
{
    public const COST_INSERT = 50;

    public const COST_BIND = 50;

    public const COST_TRANSITION = 50;

    public const COST_DELETE = 50;

    public const COST_LIST = 1;

    public static function record(int $units): void
    {
        $key = self::cacheKey();

        Cache::add($key, 0, now()->endOfDay());
        Cache::increment($key, $units);
    }

    public static function todayUsage(): int
    {
        return (int) Cache::get(self::cacheKey(), 0);
    }

    private static function cacheKey(): string
    {
        return 'youtube_api_quota:'.now()->toDateString();
    }
}
