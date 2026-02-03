<?php

namespace App\Utils\Services;

use Carbon\Carbon;
use Closure;
use Illuminate\Support\Facades\Cache;

class CacheService
{
    public static function remember(string $key, Closure $callback, ?Carbon $time = null, array|string $tags = [])
    {
        if (is_null($time)) {
            $time = now()->addHour();
        }

        return Cache::tags($tags)->remember($key, $time, $callback);
    }

    public static function flush(array|string $tags)
    {
        return cache()->tags($tags)->flush();
    }

    public static function forget(?string $key = null, array|string $tags = [])
    {
        if ($key) {
            return cache()->tags($tags)->forget($key);
        }

        return cache()->tags($tags)->flush();
    }

    public static function flushAll()
    {
        return cache()->flush();
    }
}
