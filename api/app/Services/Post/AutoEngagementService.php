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
 * Admin: enabled + daily max. Fresh posts (≤ {@see PostsSettings::AUTO_ENGAGEMENT_FRESH_DAYS})
 * use an aggressive daily band; older posts stay eligible under soft lifetime but drip slowly.
 * Soft like lifetime = dailyMax × fresh days; reel views use a mild lead over likes.
 *
 * Pace: every 15 minutes, ~{@see self::TARGET_PASSES_PER_DAY} catalog passes/day.
 * Reels keep likes_count < views_count; simple posts get likes only.
 *
 * Cursor: {@see self::CURSOR_CACHE_KEY}. Daily state: {@see self::dailyStateCacheKey()}.
 */
class AutoEngagementService
{
    public const CURSOR_CACHE_KEY = 'posts.auto_engagement.cursor_id';

    /** Keep in sync with routes/console.php (everyFifteenMinutes). */
    private const TICKS_PER_DAY = 96;

    private const TARGET_PASSES_PER_DAY = 3;

    private const MAX_CHUNK = 200;

    private const FRESH_DRIP_PER_TICK = 12;

    private const MATURE_DRIP_PER_TICK = 2;

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

            return 0;
        }

        $chunk = $this->chunkSize();
        $today = now()->toDateString();
        $touched = 0;
        $scanned = 0;
        $wrapped = false;
        $maxScan = max($chunk * 10, min(self::MAX_CHUNK, $remaining));

        while ($touched < $chunk && $scanned < $maxScan) {
            $post = $this->underTargetQuery($reelsMax, $simpleMax, $reelsViewMax)
                ->where('id', '>', $this->cursor())
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

            [$likeMax, $viewMax] = $this->targetsForPost($post, $reelsMax, $simpleMax, $reelsViewMax);
            if ($likeMax === 0 && $viewMax === 0) {
                continue;
            }

            [$dailyMin, $dailyMax, $dripCap] = $this->paceForPost(
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

            $state = $this->dailyState((int) $post->id, $today, $dailyMin, $dailyMax);
            $video = $this->isVideo($post);
            $likeRoom = max(0, $state['quota'] - $state['likes']);
            $viewQuota = $video ? $this->settings->scaleViewsAboveLikes($state['quota']) : 0;
            $viewRoom = max(0, $viewQuota - $state['views']);

            $dripLikes = min($dripCap, $likeRoom);
            $dripViews = $video
                ? min(max($dripCap, $dripLikes * (1 + self::EXTRA_VIEWS_PER_AUTO_LIKE)), $viewRoom)
                : 0;

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
        $this->storeCursor(0);
    }

    public function cursor(): int
    {
        return max(0, (int) Cache::get(self::CURSOR_CACHE_KEY, 0));
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

    /**
     * @return array{0: int, 1: int, 2: int} [dailyMin, dailyMax, dripCap]
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
                ? [$reelsDailyMin, $reelsDailyMax, self::FRESH_DRIP_PER_TICK]
                : [$simpleDailyMin, $simpleDailyMax, self::FRESH_DRIP_PER_TICK];
        }

        $base = $video ? $reelsDaily : $simpleDaily;
        [$min, $max] = $this->settings->matureDailyDripRange($base);

        return [$min, $max, self::MATURE_DRIP_PER_TICK];
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

    private function storeCursor(int $postId): void
    {
        Cache::forever(self::CURSOR_CACHE_KEY, max(0, $postId));
    }

    private function reloadSettings(): void
    {
        app()->forgetInstance(PostsSettings::class);
        $this->settings = app(PostsSettings::class);
    }
}
