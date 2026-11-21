<?php

namespace App\Services\Post;

use App\Enums\Push\NotificationEventEnum;
use App\Events\PostLiked;
use App\Models\Post;
use App\Models\User;
use App\Notifications\PostLikedUserNotification;
use App\Services\Push\PushNotificationService;
use App\Support\Notifications\PostLikedNotifyCopy;
use Carbon\Carbon;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Buffers silent auto likes and flushes one combined DB + push notify per post.
 *
 * Real user likes still fire {@see PostLiked} immediately.
 */
class AutoLikeNotificationDigest
{
    public const INDEX_CACHE_KEY = 'posts.auto_like_digest.index';

    public const WINDOW_MINUTES = 30;

    private const STATE_TTL_DAYS = 2;

    private const FLUSH_LOCK_KEY = 'posts.auto_like_digest.flush_lock';

    private const INDEX_LOCK_KEY = 'posts.auto_like_digest.index_lock';

    public function __construct(
        private readonly PushNotificationService $pushService,
    ) {}

    public static function stateCacheKey(int $postId): string
    {
        return "posts.auto_like_digest.{$postId}";
    }

    public static function recordLockKey(int $postId): string
    {
        return "posts.auto_like_digest.lock.{$postId}";
    }

    public function record(Post $post, User $actor): void
    {
        $postId = (int) $post->id;
        $actorId = (int) $actor->id;
        if ($postId <= 0 || $actorId <= 0) {
            return;
        }

        try {
            Cache::lock(self::recordLockKey($postId), 5)->block(3, function () use ($postId, $actorId): void {
                $key = self::stateCacheKey($postId);
                $state = Cache::get($key);
                if (! is_array($state)) {
                    $state = ['actor_id' => null, 'count' => 0, 'first_at' => null];
                }

                $state['actor_id'] = $actorId;
                $state['count'] = ((int) ($state['count'] ?? 0)) + 1;
                $state['first_at'] ??= now()->toIso8601String();

                Cache::put($key, $state, now()->addDays(self::STATE_TTL_DAYS));
                $this->rememberPending($postId);
            });
        } catch (LockTimeoutException $e) {
            Log::warning('AutoLikeNotificationDigest record lock timeout', [
                'post_id' => $postId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Flush digests whose window has elapsed (or all when $force).
     *
     * @return int Number of posts flushed
     */
    public function flushDue(bool $force = false): int
    {
        $lock = Cache::lock(self::FLUSH_LOCK_KEY, 30);
        if (! $lock->get()) {
            return 0;
        }

        try {
            return $this->flushDueLocked($force);
        } finally {
            $lock->release();
        }
    }

    private function flushDueLocked(bool $force): int
    {
        $index = Cache::get(self::INDEX_CACHE_KEY, []);
        if (! is_array($index) || $index === []) {
            return 0;
        }

        $remaining = [];
        $flushed = 0;

        foreach (array_keys($index) as $postId) {
            $postId = (int) $postId;
            if ($postId <= 0) {
                continue;
            }

            $stateKey = self::stateCacheKey($postId);
            $state = Cache::get($stateKey);
            if (! is_array($state) || (int) ($state['count'] ?? 0) <= 0) {
                Cache::forget($stateKey);

                continue;
            }

            $firstAt = isset($state['first_at'])
                ? Carbon::parse((string) $state['first_at'])
                : null;

            if (
                ! $force
                && $firstAt !== null
                && $firstAt->gt(now()->subMinutes(self::WINDOW_MINUTES))
            ) {
                $remaining[$postId] = true;

                continue;
            }

            $outcome = $this->dispatch($postId, $state);
            if ($outcome === 'flushed') {
                $flushed++;
                Cache::forget($stateKey);
            } elseif ($outcome === 'discard') {
                Cache::forget($stateKey);
            } else {
                // Transient failure — keep for the next flush tick.
                $remaining[$postId] = true;
            }
        }

        Cache::lock(self::INDEX_LOCK_KEY, 5)->block(3, function () use ($remaining): void {
            if ($remaining === []) {
                Cache::forget(self::INDEX_CACHE_KEY);
            } else {
                Cache::put(self::INDEX_CACHE_KEY, $remaining, now()->addDays(self::STATE_TTL_DAYS));
            }
        });

        return $flushed;
    }

    /**
     * @param  array{actor_id?: int|null, count?: int, first_at?: string|null}  $state
     * @return 'flushed'|'discard'|'retry'
     */
    private function dispatch(int $postId, array $state): string
    {
        $actorId = (int) ($state['actor_id'] ?? 0);
        $count = max(1, (int) ($state['count'] ?? 0));
        if ($actorId <= 0) {
            return 'discard';
        }

        $post = Post::query()->find($postId);
        $actor = User::query()->find($actorId);
        if (! $post || ! $actor || $post->user_id === null) {
            return 'discard';
        }

        if ((int) $post->user_id === (int) $actor->id) {
            return 'discard';
        }

        $othersCount = max(0, $count - 1);

        try {
            $post->loadMissing('user');
            $owner = $post->user;
            if (! $owner) {
                return 'discard';
            }

            $owner->notify(new PostLikedUserNotification($post, $actor, $othersCount));

            try {
                $this->pushService->dispatch(
                    NotificationEventEnum::POST_LIKED,
                    PostLikedNotifyCopy::pushVars($post, $actor, $othersCount),
                    (int) $post->user_id,
                );
            } catch (Throwable $e) {
                // DB notify already landed — treat as flushed so we don't double-notify.
                Log::warning('AutoLikeNotificationDigest push failed', [
                    'post_id' => $postId,
                    'error' => $e->getMessage(),
                ]);
            }

            return 'flushed';
        } catch (Throwable $e) {
            Log::error('AutoLikeNotificationDigest dispatch failed', [
                'post_id' => $postId,
                'error' => $e->getMessage(),
            ]);

            return 'retry';
        }
    }

    private function rememberPending(int $postId): void
    {
        Cache::lock(self::INDEX_LOCK_KEY, 5)->block(3, function () use ($postId): void {
            $index = Cache::get(self::INDEX_CACHE_KEY, []);
            if (! is_array($index)) {
                $index = [];
            }
            $index[$postId] = true;
            Cache::put(self::INDEX_CACHE_KEY, $index, now()->addDays(self::STATE_TTL_DAYS));
        });
    }
}
