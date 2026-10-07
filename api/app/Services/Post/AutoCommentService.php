<?php

namespace App\Services\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\User;
use App\Settings\PostsSettings;
use App\Support\Post\AutoCommentPhrases;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Sparse top-level comments from dormant accounts (never active or inactive 30+ days).
 *
 * Separate from likes/views. Comments stay far below likes (and views on reels).
 */
class AutoCommentService
{
    public const CURSOR_CACHE_KEY = 'posts.auto_comments.cursor_id';

    public const DORMANT_DAYS = 30;

    /** Skip most hourly visits so comments do not land every hour. */
    private const SKIP_TICK_PERCENT = 70;

    private const TICKS_PER_DAY = 24;

    private const TARGET_PASSES_PER_DAY = 2;

    private const MAX_CHUNK = 80;

    public function __construct(
        private PostsSettings $settings,
        private readonly PostCommentService $comments,
    ) {}

    public function process(): int
    {
        $this->reloadSettings();

        if (! $this->settings->autoEngagementIsEnabled()) {
            return 0;
        }

        $reelsDaily = $this->settings->reelsCommentDailyMax();
        $simpleDaily = $this->settings->simpleCommentDailyMax();
        if ($reelsDaily === 0 && $simpleDaily === 0) {
            return 0;
        }

        $reelsMax = $this->settings->reelsCommentLifetimeMax();
        $simpleMax = $this->settings->simpleCommentLifetimeMax();
        $remaining = $this->eligibleQuery($reelsMax, $simpleMax)->count();
        if ($remaining === 0) {
            $this->resetCursor();

            return 0;
        }

        $chunk = $this->chunkSize();
        $today = now()->toDateString();
        $touched = 0;
        $scanned = 0;
        $wrapped = false;
        $maxScan = max($chunk * 12, min(self::MAX_CHUNK, $remaining));

        while ($touched < $chunk && $scanned < $maxScan) {
            $post = $this->eligibleQuery($reelsMax, $simpleMax)
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

            if ($this->shouldSkipTick($post)) {
                continue;
            }

            $lifetime = $this->lifetimeForPost($post, $reelsMax, $simpleMax);
            $dailyMax = $this->dailyMaxForPost($post, $reelsDaily, $simpleDaily);
            if ($lifetime <= 0 || $dailyMax <= 0) {
                continue;
            }

            if (! $this->isWithinFreshWindow($post)) {
                $dailyMax = 1;
            }

            $room = $this->commentRoom($post, $lifetime);
            if ($room <= 0) {
                continue;
            }

            $state = $this->dailyState((int) $post->id, $today, $dailyMax);
            if ($state['comments'] >= $state['quota']) {
                continue;
            }

            if ($this->commentOnPost($post)) {
                $this->bumpDailyState((int) $post->id, $today, $state);
                $touched++;
            }
        }

        return $touched;
    }

    public function remainingEligibleCount(?int $reelsMax = null, ?int $simpleMax = null): int
    {
        $this->reloadSettings();
        $reelsMax ??= $this->settings->reelsCommentLifetimeMax();
        $simpleMax ??= $this->settings->simpleCommentLifetimeMax();

        if ($reelsMax === 0 && $simpleMax === 0) {
            return 0;
        }

        return $this->eligibleQuery($reelsMax, $simpleMax)->count();
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
            ->where('likes_count', '>', 0)
            ->count();

        if ($ready <= 0) {
            return 1;
        }

        $slots = max(1, intdiv(self::TICKS_PER_DAY, self::TARGET_PASSES_PER_DAY));

        return max(1, min(self::MAX_CHUNK, (int) ceil($ready / $slots)));
    }

    public static function dailyStateCacheKey(int $postId, string $date): string
    {
        return "posts.auto_comments.daily.{$postId}.{$date}";
    }

    public function commentOnPost(Post $post): bool
    {
        $post = $post->fresh() ?? $post;
        if (
            $post->published_at === null
            || $post->user_id === null
            || $post->status !== PostStatusEnum::Ready
        ) {
            return false;
        }

        if ($this->commentRoom($post, PHP_INT_MAX) <= 0) {
            return false;
        }

        $actor = $this->randomDormantUserExceptOwner((int) $post->user_id, (int) $post->id);
        if (! $actor) {
            return false;
        }

        $post->loadMissing('user:id,name,nickname');
        $creatorFirstName = AutoCommentPhrases::firstNameFrom(
            (string) ($post->user?->name ?: $post->user?->nickname ?: '')
        );

        $body = AutoCommentPhrases::randomUnused(
            PostComment::query()->where('post_id', $post->id)->pluck('body'),
            $creatorFirstName,
        );
        if ($body === null) {
            return false;
        }

        try {
            $this->comments->create($post, $actor, $body);

            return true;
        } catch (Throwable $e) {
            Log::warning('auto_comments.create_failed', [
                'post_id' => $post->id,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    private function shouldSkipTick(Post $post): bool
    {
        if (app()->environment('testing')) {
            return false;
        }

        $skipPercent = $this->isWithinFreshWindow($post)
            ? self::SKIP_TICK_PERCENT
            : 90;

        return random_int(1, 100) <= $skipPercent;
    }

    private function commentRoom(Post $post, int $lifetime): int
    {
        $likes = (int) $post->likes_count;
        $comments = (int) $post->comments_count;
        $likeCap = $this->settings->commentCapFromLikes($likes);
        $cap = min($lifetime, $likeCap);

        if ($this->isVideo($post)) {
            $cap = min($cap, max(0, (int) $post->views_count - 1));
        }

        return max(0, $cap - $comments);
    }

    private function lifetimeForPost(Post $post, int $reelsMax, int $simpleMax): int
    {
        return $this->isVideo($post) ? $reelsMax : $simpleMax;
    }

    private function dailyMaxForPost(Post $post, int $reelsDaily, int $simpleDaily): int
    {
        return $this->isVideo($post) ? $reelsDaily : $simpleDaily;
    }

    /** @return Builder<Post> */
    private function eligibleQuery(int $reelsMax, int $simpleMax): Builder
    {
        return Post::query()
            ->whereNotNull('published_at')
            ->where('status', PostStatusEnum::Ready)
            ->where('likes_count', '>', 0)
            ->where(function ($q) use ($reelsMax, $simpleMax) {
                $hasVideo = false;

                if ($reelsMax > 0) {
                    $q->where(function ($video) use ($reelsMax) {
                        $video->where('type', PostTypeEnum::Video)
                            ->where('comments_count', '<', $reelsMax)
                            ->whereColumn('comments_count', '<', 'likes_count')
                            ->whereColumn('comments_count', '<', 'views_count')
                            ->whereRaw('comments_count < FLOOR(likes_count * '.PostsSettings::AUTO_COMMENT_TO_LIKE_RATIO.')');
                    });
                    $hasVideo = true;
                }

                if ($simpleMax > 0) {
                    $method = $hasVideo ? 'orWhere' : 'where';
                    $q->{$method}(function ($simple) use ($simpleMax) {
                        $simple->where('type', '!=', PostTypeEnum::Video)
                            ->where('comments_count', '<', $simpleMax)
                            ->whereColumn('comments_count', '<', 'likes_count')
                            ->whereRaw('comments_count < FLOOR(likes_count * '.PostsSettings::AUTO_COMMENT_TO_LIKE_RATIO.')');
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

    private function randomDormantUserExceptOwner(int $ownerId, int $postId): ?User
    {
        return User::query()
            ->where('type', UserTypeEnum::USER)
            ->where('status', UserStatusEnum::ACTIVE)
            ->where('id', '!=', $ownerId)
            ->inactiveDays((string) self::DORMANT_DAYS)
            ->whereNotIn('id', PostComment::query()->where('post_id', $postId)->select('user_id'))
            ->inRandomOrder()
            ->first();
    }

    private function isVideo(Post $post): bool
    {
        $type = $post->type instanceof PostTypeEnum
            ? $post->type
            : PostTypeEnum::tryFrom((string) $post->type);

        return $type === PostTypeEnum::Video;
    }

    /** @return array{quota: int, comments: int} */
    private function dailyState(int $postId, string $date, int $dailyMax): array
    {
        $key = self::dailyStateCacheKey($postId, $date);
        $cached = Cache::get($key);

        if (is_array($cached) && isset($cached['quota'], $cached['comments'])) {
            return [
                'quota' => (int) $cached['quota'],
                'comments' => (int) $cached['comments'],
            ];
        }

        $quota = max(1, $dailyMax);
        $state = ['quota' => $quota, 'comments' => 0];
        Cache::put($key, $state, now()->addDays(2));

        return $state;
    }

    /** @param  array{quota: int, comments: int}  $prior */
    private function bumpDailyState(int $postId, string $date, array $prior): void
    {
        Cache::put(self::dailyStateCacheKey($postId, $date), [
            'quota' => $prior['quota'],
            'comments' => $prior['comments'] + 1,
        ], now()->addDays(2));
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
