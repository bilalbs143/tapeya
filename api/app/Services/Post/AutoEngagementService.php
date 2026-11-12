<?php

namespace App\Services\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
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
 * Drip silent likes/views onto public ready posts from random active users.
 *
 * Admin: enabled + daily max. Hot posts (≤ {@see PostsSettings::AUTO_ENGAGEMENT_HOT_DAYS})
 * use an aggressive daily band; older posts stay eligible under soft lifetime but drip slowly.
 * Soft like lifetime = dailyMax × {@see PostsSettings::AUTO_ENGAGEMENT_LIFE_DAYS}; reel views lead likes.
 *
 * Pace: every 10 minutes, at most one like (and matching views) per post,
 * and at most one like per post owner (natural drip, no notification stack).
 * Each tick processes hot under-target posts first, then mature if capacity remains.
 * Owners with many posts rotate which reel gets the like within the active pass.
 * Reels keep likes_count < views_count; simple posts get likes only.
 *
 * Cursors: {@see self::CURSOR_CACHE_KEY} (hot), {@see self::MATURE_CURSOR_CACHE_KEY}.
 * Daily state: {@see self::dailyStateCacheKey()}.
 */
class AutoEngagementService
{
    public const CURSOR_CACHE_KEY = 'posts.auto_engagement.cursor_id';

    public const MATURE_CURSOR_CACHE_KEY = 'posts.auto_engagement.mature_cursor_id';

    /** Keep in sync with routes/console.php (everyTenMinutes). */
    private const TICKS_PER_DAY = 144;

    /** One catalog pass per 10-minute tick so likes can spread across the day. */
    private const TARGET_PASSES_PER_DAY = 144;

    private const MAX_CHUNK = 200;

    /** Never stack likes on the same post in one tick. */
    private const LIKE_PER_TICK = 1;

    /** Max likes across different posts for the same creator in one tick (keeps notifications natural). */
    private const LIKES_PER_OWNER_PER_TICK = 1;

    /** Extra viewers beyond the liker so reel likes stay strictly below views. */
    private const EXTRA_VIEWS_PER_AUTO_LIKE = 1;

    public function __construct(
        private PostsSettings $settings,
        private readonly PostInteractionService $interactions,
        private readonly PostViewService $views,
    ) {}

    /** Process the next chunk of eligible posts. Returns posts touched. */
    public function process(): int
    {
        $this->reloadSettings();

        if (! $this->settings->autoEngagementIsEnabled()) {
            return 0;
        }

        $reelsDaily = $this->settings->reelsDailyMax();
        $simpleDaily = $this->settings->simpleDailyMax();
        if ($reelsDaily === 0 && $simpleDaily === 0) {
            return 0;
        }

        $reelsMax = $this->settings->reelsLifetimeMax();
        $reelsViewMax = $this->settings->reelsViewsLifetimeMax();
        $simpleMax = $this->settings->simpleLifetimeMax();
        [$reelsDailyMin, $reelsDailyMax] = $this->settings->dailyDripRange($reelsDaily);
        [$simpleDailyMin, $simpleDailyMax] = $this->settings->dailyDripRange($simpleDaily);

        $remaining = $this->underTargetQuery($reelsMax, $simpleMax, $reelsViewMax)->count();
        if ($remaining === 0) {
            $this->resetCursor();
            $this->resetMatureCursor();

            return 0;
        }

        $chunk = $this->chunkSize();
        $today = now()->toDateString();
        $likedThisTick = 0;
        $scanned = 0;
        /** @var array<int, int> likes already applied per owner this tick */
        $ownerLikesThisTick = [];
        /** @var array<int, true> posts that already received a like this tick (blocks wrap re-hits) */
        $postsLikedThisTick = [];
        $maxScan = max($chunk * 20, min(self::MAX_CHUNK * 3, max($remaining, $chunk)));

        $hotCutoff = now()->subDays($this->settings->autoEngagementFreshDays());
        $hotScope = static function (Builder $q) use ($hotCutoff): Builder {
            return $q->where('published_at', '>=', $hotCutoff);
        };
        $matureScope = static function (Builder $q) use ($hotCutoff): Builder {
            return $q->where('published_at', '<', $hotCutoff);
        };

        $this->runAgePass(
            $hotScope,
            self::CURSOR_CACHE_KEY,
            $chunk,
            $maxScan,
            $today,
            $reelsDaily,
            $simpleDaily,
            $reelsDailyMin,
            $reelsDailyMax,
            $simpleDailyMin,
            $simpleDailyMax,
            $reelsMax,
            $simpleMax,
            $reelsViewMax,
            $likedThisTick,
            $scanned,
            $ownerLikesThisTick,
            $postsLikedThisTick,
        );

        if ($likedThisTick < $chunk && $scanned < $maxScan) {
            $this->runAgePass(
                $matureScope,
                self::MATURE_CURSOR_CACHE_KEY,
                $chunk,
                $maxScan,
                $today,
                $reelsDaily,
                $simpleDaily,
                $reelsDailyMin,
                $reelsDailyMax,
                $simpleDailyMin,
                $simpleDailyMax,
                $reelsMax,
                $simpleMax,
                $reelsViewMax,
                $likedThisTick,
                $scanned,
                $ownerLikesThisTick,
                $postsLikedThisTick,
            );
        }

        return $likedThisTick;
    }

    /**
     * Scan one age band (hot or mature) until chunk/scan limits are hit.
     *
     * @param  callable(Builder): Builder  $ageScope
     * @param  array<int, int>  $ownerLikesThisTick
     * @param  array<int, true>  $postsLikedThisTick
     */
    private function runAgePass(
        callable $ageScope,
        string $cursorKey,
        int $chunk,
        int $maxScan,
        string $today,
        int $reelsDaily,
        int $simpleDaily,
        int $reelsDailyMin,
        int $reelsDailyMax,
        int $simpleDailyMin,
        int $simpleDailyMax,
        int $reelsMax,
        int $simpleMax,
        int $reelsViewMax,
        int &$likedThisTick,
        int &$scanned,
        array &$ownerLikesThisTick,
        array &$postsLikedThisTick,
    ): void {
        $wrapped = false;

        while ($likedThisTick < $chunk && $scanned < $maxScan) {
            $query = $ageScope($this->underTargetQuery($reelsMax, $simpleMax, $reelsViewMax))
                ->where('id', '>', $this->cursorFor($cursorKey))
                ->orderBy('id');

            $post = $query->first();

            if ($post === null) {
                if ($wrapped) {
                    break;
                }
                $this->storeCursorFor($cursorKey, 0);
                $wrapped = true;

                continue;
            }

            $scanned++;
            $postId = (int) $post->id;
            $this->storeCursorFor($cursorKey, $postId);

            if (isset($postsLikedThisTick[$postId])) {
                continue;
            }

            $ownerId = (int) $post->user_id;
            if ($ownerId > 0 && ($ownerLikesThisTick[$ownerId] ?? 0) >= self::LIKES_PER_OWNER_PER_TICK) {
                // One like per creator per tick — natural drip, no notification stacks.
                continue;
            }

            [$likeMax, $viewMax] = $this->targetsForPost($post, $reelsMax, $simpleMax, $reelsViewMax);
            if ($likeMax === 0 && $viewMax === 0) {
                continue;
            }

            [$dailyMin, $dailyMax] = $this->paceForPost(
                $post,
                $reelsDaily,
                $simpleDaily,
                $reelsDailyMin,
                $reelsDailyMax,
                $simpleDailyMin,
                $simpleDailyMax,
            );
            if ($dailyMax <= 0) {
                continue;
            }

            $state = $this->dailyState($postId, $today, $dailyMin, $dailyMax);
            $video = $this->isVideo($post);
            $likeRoom = max(0, $state['quota'] - $state['likes']);
            $viewQuota = $video ? $this->settings->scaleViewsAboveLikes($state['quota']) : 0;
            $viewRoom = max(0, $viewQuota - $state['views']);

            if ($likeRoom > 0 && $ownerId > 0 && $this->shouldSkipForOwnerRotation(
                $post,
                $ownerId,
                $today,
                $reelsMax,
                $simpleMax,
                $reelsViewMax,
                $ageScope,
            )) {
                continue;
            }

            $applyLike = $likeRoom > 0
                && $ownerId > 0
                && $this->shouldApplyLikeThisTick($likeRoom);
            $dripLikes = $applyLike ? min(self::LIKE_PER_TICK, $likeRoom) : 0;
            $dripViews = 0;
            if ($video) {
                if ($applyLike) {
                    $dripViews = min(1 + self::EXTRA_VIEWS_PER_AUTO_LIKE, $viewRoom);
                } elseif ($likeRoom <= 0 && (int) $post->views_count <= (int) $post->likes_count) {
                    // Silent view repair only when likes are done for the day.
                    $dripViews = min(1, $viewRoom);
                }
            }

            if ($dripLikes <= 0 && $dripViews <= 0) {
                continue;
            }

            [$likesAdded, $viewsAdded] = $this->dripEngagePost($post, $likeMax, $viewMax, $dripLikes, $dripViews);
            if ($likesAdded > 0 || $viewsAdded > 0) {
                $this->bumpDailyState($postId, $today, $likesAdded, $viewsAdded, $state);
            }
            if ($likesAdded > 0 && $ownerId > 0) {
                $postsLikedThisTick[$postId] = true;
                $ownerLikesThisTick[$ownerId] = ($ownerLikesThisTick[$ownerId] ?? 0) + 1;
                $this->storeOwnerLikeCursor($ownerId, $today, $postId);
                $likedThisTick++;
            }
        }
    }

    public function remainingUnderTargetCount(?int $reelsMax = null, ?int $simpleMax = null, ?int $reelsViewMax = null): int
    {
        $this->reloadSettings();
        $reelsMax ??= $this->settings->reelsLifetimeMax();
        $simpleMax ??= $this->settings->simpleLifetimeMax();
        $reelsViewMax ??= $this->settings->reelsViewsLifetimeMax();

        if ($reelsMax === 0 && $simpleMax === 0) {
            return 0;
        }

        return $this->underTargetQuery($reelsMax, $simpleMax, $reelsViewMax)->count();
    }

    public function isComplete(): bool
    {
        return $this->remainingUnderTargetCount() === 0;
    }

    public function resetCursor(): void
    {
        $this->storeCursorFor(self::CURSOR_CACHE_KEY, 0);
    }

    public function resetMatureCursor(): void
    {
        $this->storeCursorFor(self::MATURE_CURSOR_CACHE_KEY, 0);
    }

    public function cursor(): int
    {
        return $this->cursorFor(self::CURSOR_CACHE_KEY);
    }

    public function matureCursor(): int
    {
        return $this->cursorFor(self::MATURE_CURSOR_CACHE_KEY);
    }

    public function chunkSize(): int
    {
        $ready = Post::query()
            ->whereNotNull('published_at')
            ->where('status', PostStatusEnum::Ready)
            ->count();

        if ($ready <= 0) {
            return 1;
        }

        $slots = max(1, intdiv(self::TICKS_PER_DAY, self::TARGET_PASSES_PER_DAY));

        return max(1, min(self::MAX_CHUNK, (int) ceil($ready / $slots)));
    }

    /**
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

        if (! $this->isVideo($post)) {
            while ($likesAdded < $dripLikes && (int) $post->likes_count < $likeMax) {
                $actor = $this->randomActiveUserExceptOwner((int) $post->user_id, forLikeOnPostId: (int) $post->id);
                if (! $actor) {
                    break;
                }

                try {
                    $this->interactions->like($post, $actor);
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

            return [$likesAdded, 0];
        }

        // Reels: repair lagging views, drip likes (each keeps views ahead), then fill view room.
        if ((int) $post->likes_count > 0) {
            $this->ensureViewsAhead($post, $viewsAdded, $dripViews, $viewMax);
        }

        while ($likesAdded < $dripLikes && (int) $post->likes_count < $likeMax) {
            $viewsNeeded = 1 + self::EXTRA_VIEWS_PER_AUTO_LIKE;
            if (($dripViews - $viewsAdded) < $viewsNeeded || ((int) $post->views_count + $viewsNeeded) > $viewMax) {
                break;
            }

            $actor = $this->randomActiveUserExceptOwner((int) $post->user_id, forLikeOnPostId: (int) $post->id);
            if (! $actor) {
                break;
            }

            try {
                $this->interactions->like($post, $actor);
                $likesAdded++;

                try {
                    $this->views->recordCountedForUser($post->fresh() ?? $post, $actor);
                    $viewsAdded++;
                } catch (Throwable $e) {
                    Log::warning('auto_engagement.view_after_like_failed', [
                        'post_id' => $post->id,
                        'message' => $e->getMessage(),
                    ]);
                }

                $post = $post->fresh() ?? $post;
                if (! $this->ensureViewsAhead($post, $viewsAdded, $dripViews, $viewMax)) {
                    break;
                }
            } catch (Throwable $e) {
                Log::warning('auto_engagement.like_failed', [
                    'post_id' => $post->id,
                    'message' => $e->getMessage(),
                ]);
                break;
            }

            $post = $post->fresh() ?? $post;
        }

        while ($viewsAdded < $dripViews && (int) $post->views_count < $viewMax) {
            if (! $this->recordAutoView($post, $viewsAdded)) {
                break;
            }
            $post = $post->fresh() ?? $post;
        }

        return [$likesAdded, $viewsAdded];
    }

    public static function dailyStateCacheKey(int $postId, string $date): string
    {
        return "posts.auto_engagement.daily.{$postId}.{$date}";
    }

    public static function ownerLikeCursorCacheKey(int $ownerId, string $date): string
    {
        return "posts.auto_engagement.owner_like_cursor.{$ownerId}.{$date}";
    }

    /**
     * Rotate likes across a creator's posts so the same reel is not hit every tick.
     */
    /**
     * @param  (callable(Builder): Builder)|null  $ageScope  Limit rotation to the active hot/mature pass.
     */
    private function shouldSkipForOwnerRotation(
        Post $post,
        int $ownerId,
        string $date,
        int $reelsMax,
        int $simpleMax,
        int $reelsViewMax,
        ?callable $ageScope = null,
    ): bool {
        $lastId = (int) Cache::get(self::ownerLikeCursorCacheKey($ownerId, $date), 0);
        if ($lastId <= 0 || (int) $post->id > $lastId) {
            return false;
        }

        $query = $this->underTargetQuery($reelsMax, $simpleMax, $reelsViewMax)
            ->where('user_id', $ownerId)
            ->where('id', '>', $lastId);
        if ($ageScope !== null) {
            $query = $ageScope($query);
        }

        if ($query->exists()) {
            return true;
        }

        Cache::forget(self::ownerLikeCursorCacheKey($ownerId, $date));

        return false;
    }

    private function storeOwnerLikeCursor(int $ownerId, string $date, int $postId): void
    {
        Cache::put(self::ownerLikeCursorCacheKey($ownerId, $date), max(0, $postId), now()->addDays(2));
    }

    /**
     * @return array{0: int, 1: int} [dailyMin, dailyMax]
     */
    private function paceForPost(
        Post $post,
        int $reelsDaily,
        int $simpleDaily,
        int $reelsDailyMin,
        int $reelsDailyMax,
        int $simpleDailyMin,
        int $simpleDailyMax,
    ): array {
        $video = $this->isVideo($post);

        if ($this->isWithinFreshWindow($post)) {
            return $video
                ? [$reelsDailyMin, $reelsDailyMax]
                : [$simpleDailyMin, $simpleDailyMax];
        }

        $base = $video ? $reelsDaily : $simpleDaily;

        return $this->settings->matureDailyDripRange($base);
    }

    /**
     * Spread remaining daily likes across leftover 10-minute slots (at most one like per tick).
     */
    private function shouldApplyLikeThisTick(int $likeRoom): bool
    {
        if ($likeRoom <= 0) {
            return false;
        }

        if (app()->environment('testing')) {
            return true;
        }

        $ticksLeft = $this->remainingTicksToday();
        $chance = (int) ceil(($likeRoom / $ticksLeft) * 100);
        $chance = max(1, min(100, $chance));

        return random_int(1, 100) <= $chance;
    }

    private function remainingTicksToday(): int
    {
        $elapsed = ((int) now()->hour * 6) + intdiv((int) now()->minute, 10);

        return max(1, self::TICKS_PER_DAY - $elapsed);
    }

    /** @return array{0: int, 1: int} [likeMax, viewMax] */
    private function targetsForPost(Post $post, int $reelsMax, int $simpleMax, int $reelsViewMax): array
    {
        return $this->isVideo($post) ? [$reelsMax, $reelsViewMax] : [$simpleMax, 0];
    }

    /**
     * Add views until views_count > likes_count (or budget/lifetime exhausted).
     *
     * @return bool true when invariant holds
     */
    private function ensureViewsAhead(Post &$post, int &$viewsAdded, int $dripViews, int $viewMax): bool
    {
        while ((int) $post->views_count <= (int) $post->likes_count) {
            if ($viewsAdded >= $dripViews || (int) $post->views_count >= $viewMax) {
                return false;
            }
            if (! $this->recordAutoView($post, $viewsAdded)) {
                return false;
            }
            $post = $post->fresh() ?? $post;
        }

        return true;
    }

    private function recordAutoView(Post $post, int &$viewsAdded): bool
    {
        $actor = $this->randomActiveUserExceptOwner((int) $post->user_id, forViewOnPostId: (int) $post->id);
        if (! $actor) {
            return false;
        }

        try {
            $this->views->recordCountedForUser($post, $actor);
            $viewsAdded++;

            return true;
        } catch (Throwable $e) {
            Log::warning('auto_engagement.view_failed', [
                'post_id' => $post->id,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /** @return array{quota: int, likes: int, views: int} */
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

        $quota = $dailyMax <= $dailyMin ? $dailyMin : random_int($dailyMin, $dailyMax);
        $state = ['quota' => $quota, 'likes' => 0, 'views' => 0];
        Cache::put($key, $state, now()->addDays(2));

        return $state;
    }

    /** @param  array{quota: int, likes: int, views: int}  $prior */
    private function bumpDailyState(int $postId, string $date, int $likesAdded, int $viewsAdded, array $prior): void
    {
        Cache::put(self::dailyStateCacheKey($postId, $date), [
            'quota' => $prior['quota'],
            'likes' => $prior['likes'] + $likesAdded,
            'views' => $prior['views'] + $viewsAdded,
        ], now()->addDays(2));
    }

    /** @return Builder<Post> */
    private function underTargetQuery(int $reelsMax, int $simpleMax, int $reelsViewMax): Builder
    {
        return Post::query()
            ->whereNotNull('published_at')
            ->where('status', PostStatusEnum::Ready)
            ->where(function ($q) use ($reelsMax, $simpleMax, $reelsViewMax) {
                $hasVideo = false;

                if ($reelsMax > 0 || $reelsViewMax > 0) {
                    $q->where(function ($video) use ($reelsMax, $reelsViewMax) {
                        $video->where('type', PostTypeEnum::Video)
                            ->where(function ($targets) use ($reelsMax, $reelsViewMax) {
                                if ($reelsMax > 0) {
                                    $targets->where('likes_count', '<', $reelsMax);
                                }
                                if ($reelsViewMax > 0) {
                                    $method = $reelsMax > 0 ? 'orWhere' : 'where';
                                    $targets->{$method}('views_count', '<', $reelsViewMax);
                                }
                            });
                    });
                    $hasVideo = true;
                }

                if ($simpleMax > 0) {
                    $method = $hasVideo ? 'orWhere' : 'where';
                    $q->{$method}(function ($simple) use ($simpleMax) {
                        $simple->where('type', '!=', PostTypeEnum::Video)
                            ->where('likes_count', '<', $simpleMax);
                    });
                }
            });
    }

    private function isWithinFreshWindow(Post $post): bool
    {
        $freshDays = $this->settings->autoEngagementFreshDays();
        if ($freshDays <= 0 || $post->published_at === null) {
            return true;
        }

        return $post->published_at->gte(now()->subDays($freshDays));
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

    private function cursorFor(string $cursorKey): int
    {
        return max(0, (int) Cache::get($cursorKey, 0));
    }

    private function storeCursorFor(string $cursorKey, int $postId): void
    {
        Cache::forever($cursorKey, max(0, $postId));
    }

    /** @deprecated Use {@see storeCursorFor()} with {@see self::CURSOR_CACHE_KEY}. */
    private function storeCursor(int $postId): void
    {
        $this->storeCursorFor(self::CURSOR_CACHE_KEY, $postId);
    }

    private function reloadSettings(): void
    {
        app()->forgetInstance(PostsSettings::class);
        $this->settings = app(PostsSettings::class);
    }
}
