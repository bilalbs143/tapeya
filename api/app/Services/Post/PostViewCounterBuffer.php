<?php

namespace App\Services\Post;

use App\Models\Post;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

/**
 * Post view counter writes.
 *
 * Counts always increment MySQL immediately so the UI does not depend on
 * `schedule:work` / cron. {@see flush()} drains any leftover Redis buffer keys.
 */
class PostViewCounterBuffer
{
    private const KEY = 'reels:views:pending';

    public function bump(int $postId, int $by = 1): void
    {
        Post::query()->whereKey($postId)->increment('views_count', $by);
    }

    /**
     * Flush leftover Redis deltas into reels.views_count (legacy / recovery).
     *
     * @return int Number of reels updated
     */
    public function flush(): int
    {
        try {
            /** @var array<string, string> $all */
            $all = Redis::hgetall(self::KEY);
        } catch (\Throwable $e) {
            Log::warning('Post view Redis flush read failed', ['message' => $e->getMessage()]);

            return 0;
        }

        if ($all === []) {
            return 0;
        }

        $updated = 0;
        foreach ($all as $postId => $delta) {
            $id = (int) $postId;
            $amount = (int) $delta;
            if ($id <= 0 || $amount === 0) {
                try {
                    Redis::hdel(self::KEY, (string) $postId);
                } catch (\Throwable) {
                }

                continue;
            }

            Post::query()->whereKey($id)->increment('views_count', $amount);
            try {
                Redis::hincrby(self::KEY, (string) $id, -$amount);
                $remaining = (int) Redis::hget(self::KEY, (string) $id);
                if ($remaining === 0) {
                    Redis::hdel(self::KEY, (string) $id);
                }
            } catch (\Throwable) {
            }
            $updated++;
        }

        return $updated;
    }

    public function pendingFor(int $postId): int
    {
        return 0;
    }
}
