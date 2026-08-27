<?php

namespace App\Services\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\Post\PostVisibilityEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\PostView;
use App\Models\User;
use App\Settings\PostsSettings;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Growth helper: walk public ready posts in id chunks and drip likes/views from random
 * active users.
 *
 * Admin knobs: enabled + daily max (reels). Each calendar day picks random_int(1, dailyMax).
 * Simple posts use ~60% of that daily max. Soft lifetime = dailyMax ×
 * {@see PostsSettings::AUTO_ENGAGEMENT_FRESH_DAYS}; posts older than that window are skipped.
 *
 * Video posts: likes + views toward the same soft lifetime (each like also records a view).
 * Text/image/repost: likes only.
 *
 * Cursor: cache key {@see self::CURSOR_CACHE_KEY} via {@see Cache::forever()}.
 * Daily state: {@see self::dailyStateCacheKey()} (TTL ~2 days).
 */
class AutoEngagementService
{
    /** Durable-until-flush cursor; never use a TTL on this key. */
    public const CURSOR_CACHE_KEY = 'posts.auto_engagement.cursor_id';

    /** Scheduled every 15 minutes — spread one full sweep across the day. */
    private const TICKS_PER_DAY = 96;

    private const MAX_CHUNK = 200;

    /** Max likes/views applied to one post in a single process() tick. */
    private const MAX_DRIP_PER_TICK = 3;

    public function __construct(
        private PostsSettings $settings,
        private readonly PostInteractionService $interactions,
        private readonly PostViewService $views,
    ) {}

    /**
     * Process the next chunk of eligible posts (by id). Returns posts touched.
     */
    public function process(): int
    {
        $this->reloadSettings();

        if (! $this->settings->autoEngagementIsEnabled()) {
            return 0;
        }

        $reelsDaily = $this->settings->reelsDailyMax();
        $simpleDaily = $this->settings->simpleDailyMax();
        $reelsMax = $this->settings->reelsLifetimeMax();
        $simpleMax = $this->settings->simpleLifetimeMax();
        [$reelsDailyMin, $reelsDailyMax] = $this->settings->dailyDripRange($reelsDaily);
        [$simpleDailyMin, $simpleDailyMax] = $this->settings->dailyDripRange($simpleDaily);

        if ($reelsDaily === 0 && $simpleDaily === 0) {
            return 0;
        }

        if ($this->remainingUnderTargetCount($reelsMax, $simpleMax) === 0) {
            $this->resetCursor();

            return 0;
        }

        $chunk = $this->chunkSize();
        $today = now()->toDateString();
        $touched = 0;
        $scanned = 0;
        $wrapped = false;
        // Skip posts that already used today's drip without stalling the sweep.
        $maxScan = max($chunk * 10, min(self::MAX_CHUNK, $this->remainingUnderTargetCount($reelsMax, $simpleMax)));

        while ($touched < $chunk && $scanned < $maxScan) {
            $cursor = $this->cursor();
            $post = $this->underTargetQuery($reelsMax, $simpleMax)
                ->where('id', '>', $cursor)
                ->orderBy('id')
                ->first();

            if ($post === null) {
                if ($wrapped) {
                    break;
                }
                $this->resetCursor();
                $wrapped = true;

                continue;
            }

            $scanned++;
            $this->storeCursor((int) $post->id);

            [$likeMax, $viewMax] = $this->targetsForPost($post, $reelsMax, $simpleMax);
            if ($likeMax === 0 && $viewMax === 0) {
                continue;
            }

            [$dailyMin, $dailyMax] = $this->isVideo($post)
                ? [$reelsDailyMin, $reelsDailyMax]
                : [$simpleDailyMin, $simpleDailyMax];

            if ($dailyMax <= 0) {
                continue;
            }

            $state = $this->dailyState((int) $post->id, $today, $dailyMin, $dailyMax);
            $likeRoomToday = max(0, $state['quota'] - $state['likes']);
            $viewRoomToday = max(0, $state['quota'] - $state['views']);

            $dripLikes = min(self::MAX_DRIP_PER_TICK, $likeRoomToday);
            $dripViews = min(self::MAX_DRIP_PER_TICK, $viewRoomToday);

            if ($dripLikes <= 0 && $dripViews <= 0) {
                continue;
            }

            [$likesAdded, $viewsAdded] = $this->dripEngagePost($post, $likeMax, $viewMax, $dripLikes, $dripViews);
            if ($likesAdded > 0 || $viewsAdded > 0) {
                $this->bumpDailyState((int) $post->id, $today, $likesAdded, $viewsAdded, $state);
                $touched++;
            }
        }

        return $touched;
    }

    /** How many public ready posts still sit under type-specific lifetime max (and freshness). */
    public function remainingUnderTargetCount(?int $reelsMax = null, ?int $simpleMax = null): int
    {
        $this->reloadSettings();
        $reelsMax ??= $this->settings->reelsLifetimeMax();
        $simpleMax ??= $this->settings->simpleLifetimeMax();

        if ($reelsMax === 0 && $simpleMax === 0) {
            return 0;
        }

        return $this->underTargetQuery($reelsMax, $simpleMax)->count();
    }

    public function isComplete(): bool
    {
        return $this->remainingUnderTargetCount() === 0;
    }

    public function resetCursor(): void
    {
        $this->storeCursor(0);
    }

    /** Last processed post id (0 = start). Missing key = start. */
    public function cursor(): int
    {
        return max(0, (int) Cache::get(self::CURSOR_CACHE_KEY, 0));
    }

    /** Persist cursor with no TTL so it is not exhausted by expiry. */
    private function storeCursor(int $postId): void
    {
        Cache::forever(self::CURSOR_CACHE_KEY, max(0, $postId));
    }

    /**
     * Posts per tick from ready catalog size (~one full pass per day at 15m schedule).
     */
    public function chunkSize(): int
    {
        $ready = $this->readyPublicPostCount();

        if ($ready <= 0) {
            return 1;
        }

        return max(1, min(self::MAX_CHUNK, (int) ceil($ready / self::TICKS_PER_DAY)));
    }

    /**
     * Add likes/views toward lifetime max, capped by today's remaining drip rooms.
     *
     * @return array{0: int, 1: int} [likesAdded, viewsAdded]
     */
    public function dripEngagePost(
        Post $post,
        int $likeMax,
        int $viewMax,
        int $dripLikes,
        int $dripViews,
    ): array {
        $post = $post->fresh() ?? $post;
        if (
            $post->published_at === null
            || $post->user_id === null
            || $post->status !== PostStatusEnum::Ready
        ) {
            return [0, 0];
        }

        $likesAdded = 0;
        $viewsAdded = 0;

        while ($likesAdded < $dripLikes && (int) $post->likes_count < $likeMax) {
            $actor = $this->randomActiveUserExceptOwner((int) $post->user_id, forLikeOnPostId: (int) $post->id);
            if (! $actor) {
                break;
            }

            try {
                $this->interactions->like($post, $actor);
                if ($this->isVideo($post)) {
                    try {
                        $this->views->recordCountedForUser($post->fresh() ?? $post, $actor);
                        $viewsAdded++;
                    } catch (Throwable $e) {
                        Log::warning('auto_engagement.view_after_like_failed', [
                            'post_id' => $post->id,
                            'message' => $e->getMessage(),
                        ]);
                    }
                }
                $likesAdded++;
            } catch (Throwable $e) {
                Log::warning('auto_engagement.like_failed', [
                    'post_id' => $post->id,
                    'message' => $e->getMessage(),
                ]);
                break;
            }

            $post = $post->fresh() ?? $post;
        }

        // Catch up views when likes already at max (or simple posts skipped views).
        while ($viewsAdded < $dripViews && (int) $post->views_count < $viewMax) {
            $actor = $this->randomActiveUserExceptOwner((int) $post->user_id, forViewOnPostId: (int) $post->id);
            if (! $actor) {
                break;
            }

            try {
                $this->views->recordCountedForUser($post, $actor);
                $viewsAdded++;
            } catch (Throwable $e) {
                Log::warning('auto_engagement.view_failed', [
                    'post_id' => $post->id,
                    'message' => $e->getMessage(),
                ]);
                break;
            }

            $post = $post->fresh() ?? $post;
        }

        return [$likesAdded, $viewsAdded];
    }

    /**
     * @return array{0: int, 1: int} [likeMax, viewMax]
     */
    private function targetsForPost(Post $post, int $reelsMax, int $simpleMax): array
    {
        if ($this->isVideo($post)) {
            return [$reelsMax, $reelsMax];
        }

        return [$simpleMax, 0];
    }

    /**
     * @return array{quota: int, likes: int, views: int}
     */
    private function dailyState(int $postId, string $date, int $dailyMin, int $dailyMax): array
    {
        $key = self::dailyStateCacheKey($postId, $date);
        $cached = Cache::get($key);

        if (is_array($cached) && isset($cached['quota'], $cached['likes'], $cached['views'])) {
            return [
                'quota' => (int) $cached['quota'],
                'likes' => (int) $cached['likes'],
                'views' => (int) $cached['views'],
            ];
        }

        $quota = $dailyMax <= $dailyMin
            ? $dailyMin
            : random_int($dailyMin, $dailyMax);

        $state = ['quota' => $quota, 'likes' => 0, 'views' => 0];
        Cache::put($key, $state, now()->addDays(2));

        return $state;
    }

    /**
     * @param  array{quota: int, likes: int, views: int}  $prior
     */
    private function bumpDailyState(int $postId, string $date, int $likesAdded, int $viewsAdded, array $prior): void
    {
        $key = self::dailyStateCacheKey($postId, $date);
        Cache::put($key, [
            'quota' => $prior['quota'],
            'likes' => $prior['likes'] + $likesAdded,
            'views' => $prior['views'] + $viewsAdded,
        ], now()->addDays(2));
    }

    public static function dailyStateCacheKey(int $postId, string $date): string
    {
        return "posts.auto_engagement.daily.{$postId}.{$date}";
    }

    private function readyPublicPostCount(): int
    {
        return Post::query()
            ->whereNotNull('published_at')
            ->where('visibility', PostVisibilityEnum::Public)
            ->where('status', PostStatusEnum::Ready)
            ->count();
    }

    /**
     * @return Builder<Post>
     */
    private function underTargetQuery(int $reelsMax, int $simpleMax): Builder
    {
        $query = Post::query()
            ->whereNotNull('published_at')
            ->where('visibility', PostVisibilityEnum::Public)
            ->where('status', PostStatusEnum::Ready);

        $freshDays = $this->settings->autoEngagementFreshDays();
        if ($freshDays > 0) {
            $query->where('published_at', '>=', now()->subDays($freshDays));
        }

        return $query->where(function ($q) use ($reelsMax, $simpleMax) {
            $hasClause = false;

            if ($reelsMax > 0) {
                $q->where(function ($video) use ($reelsMax) {
                    $video->where('type', PostTypeEnum::Video)
                        ->where(function ($targets) use ($reelsMax) {
                            $targets->where('likes_count', '<', $reelsMax)
                                ->orWhere('views_count', '<', $reelsMax);
                        });
                });
                $hasClause = true;
            }

            if ($simpleMax > 0) {
                $method = $hasClause ? 'orWhere' : 'where';
                $q->{$method}(function ($simple) use ($simpleMax) {
                    $simple->where('type', '!=', PostTypeEnum::Video)
                        ->where('likes_count', '<', $simpleMax);
                });
            }
        });
    }

    private function randomActiveUserExceptOwner(
        int $ownerId,
        ?int $forLikeOnPostId = null,
        ?int $forViewOnPostId = null,
    ): ?User {
        $query = User::query()
            ->where('type', UserTypeEnum::USER)
            ->where('status', UserStatusEnum::ACTIVE)
            ->where('id', '!=', $ownerId);

        if ($forLikeOnPostId !== null) {
            $query->whereNotIn('id', PostLike::query()->where('post_id', $forLikeOnPostId)->select('user_id'));
        }

        if ($forViewOnPostId !== null) {
            $query->whereNotIn(
                'id',
                PostView::query()
                    ->where('post_id', $forViewOnPostId)
                    ->whereNotNull('user_id')
                    ->where('counted', true)
                    ->select('user_id')
            );
        }

        return $query->inRandomOrder()->first();
    }

    private function isVideo(Post $post): bool
    {
        $type = $post->type instanceof PostTypeEnum
            ? $post->type
            : PostTypeEnum::tryFrom((string) $post->type);

        return $type === PostTypeEnum::Video;
    }

    private function reloadSettings(): void
    {
        app()->forgetInstance(PostsSettings::class);
        $this->settings = app(PostsSettings::class);
    }
}
