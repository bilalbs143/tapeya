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
 * Temporary growth helper: walk public ready posts in id chunks, drip likes/views
 * from random active users. Video posts use reels targets (likes + views);
 * text/image/repost use simple-post likes only.
 *
 * Chunk size is derived from the ready-post catalog (no admin knob).
 * Cursor: cache key {@see self::CURSOR_CACHE_KEY} via {@see Cache::forever()}.
 */
class AutoEngagementService
{
    /** Durable-until-flush cursor; never use a TTL on this key. */
    public const CURSOR_CACHE_KEY = 'posts.auto_engagement.cursor_id';

    /** Scheduled every 15 minutes — spread one full sweep across the day. */
    private const TICKS_PER_DAY = 96;

    private const MAX_CHUNK = 200;

    private const MAX_DRIP = 3;

    public function __construct(
        private PostsSettings $settings,
        private readonly PostInteractionService $interactions,
        private readonly PostViewService $views,
    ) {}

    /**
     * Process the next chunk of under-target posts (by id). Returns posts touched.
     * When nothing is left under target, resets cursor and returns 0 (all done).
     */
    public function process(): int
    {
        $this->reloadSettings();

        if (! $this->settings->autoEngagementIsEnabled()) {
            return 0;
        }

        $reelsTarget = $this->settings->reelsEngagementTarget();
        $simpleTarget = $this->settings->simplePostLikesTarget();

        if ($reelsTarget === 0 && $simpleTarget === 0) {
            return 0;
        }

        if ($this->remainingUnderTargetCount($reelsTarget, $simpleTarget) === 0) {
            $this->resetCursor();

            return 0;
        }

        $chunk = $this->chunkSize();
        $cursor = $this->cursor();

        $posts = $this->underTargetQuery($reelsTarget, $simpleTarget)
            ->where('id', '>', $cursor)
            ->orderBy('id')
            ->limit($chunk)
            ->get();

        if ($posts->isEmpty()) {
            $this->resetCursor();
            $posts = $this->underTargetQuery($reelsTarget, $simpleTarget)
                ->orderBy('id')
                ->limit($chunk)
                ->get();
        }

        if ($posts->isEmpty()) {
            $this->resetCursor();

            return 0;
        }

        $touched = 0;
        foreach ($posts as $post) {
            [$likeTarget, $viewTarget] = $this->targetsForPost($post, $reelsTarget, $simpleTarget);
            if ($likeTarget === 0 && $viewTarget === 0) {
                continue;
            }

            $drip = $this->dripFor($likeTarget, $viewTarget);
            if ($this->dripEngagePost($post, $likeTarget, $viewTarget, $drip)) {
                $touched++;
            }
        }

        $this->storeCursor((int) $posts->last()->id);

        return $touched;
    }

    /** How many public ready posts still sit under type-specific targets. */
    public function remainingUnderTargetCount(?int $reelsTarget = null, ?int $simpleTarget = null): int
    {
        $this->reloadSettings();
        $reelsTarget ??= $this->settings->reelsEngagementTarget();
        $simpleTarget ??= $this->settings->simplePostLikesTarget();

        if ($reelsTarget === 0 && $simpleTarget === 0) {
            return 0;
        }

        return $this->underTargetQuery($reelsTarget, $simpleTarget)->count();
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
     * Add a small drip of likes/views toward targets.
     */
    public function dripEngagePost(Post $post, int $likeTarget, int $viewTarget, int $drip): bool
    {
        $post = $post->fresh() ?? $post;
        if (
            $post->published_at === null
            || $post->user_id === null
            || $post->status !== PostStatusEnum::Ready
        ) {
            return false;
        }

        $didWork = false;
        $likesAdded = 0;
        $viewsAdded = 0;

        while ($likesAdded < $drip && (int) $post->likes_count < $likeTarget) {
            $actor = $this->randomActiveUserExceptOwner((int) $post->user_id, forLikeOnPostId: (int) $post->id);
            if (! $actor) {
                break;
            }

            try {
                $this->interactions->like($post, $actor);
                if ($this->isVideo($post)) {
                    try {
                        $this->views->recordCountedForUser($post->fresh() ?? $post, $actor);
                    } catch (Throwable $e) {
                        Log::warning('auto_engagement.view_after_like_failed', [
                            'post_id' => $post->id,
                            'message' => $e->getMessage(),
                        ]);
                    }
                }
                $likesAdded++;
                $didWork = true;
            } catch (Throwable $e) {
                Log::warning('auto_engagement.like_failed', [
                    'post_id' => $post->id,
                    'message' => $e->getMessage(),
                ]);
                break;
            }

            $post = $post->fresh() ?? $post;
        }

        while ($viewsAdded < $drip && (int) $post->views_count < $viewTarget) {
            $actor = $this->randomActiveUserExceptOwner((int) $post->user_id, forViewOnPostId: (int) $post->id);
            if (! $actor) {
                break;
            }

            try {
                $this->views->recordCountedForUser($post, $actor);
                $viewsAdded++;
                $didWork = true;
            } catch (Throwable $e) {
                Log::warning('auto_engagement.view_failed', [
                    'post_id' => $post->id,
                    'message' => $e->getMessage(),
                ]);
                break;
            }

            $post = $post->fresh() ?? $post;
        }

        return $didWork;
    }

    /**
     * @return array{0: int, 1: int} [likeTarget, viewTarget]
     */
    private function targetsForPost(Post $post, int $reelsTarget, int $simpleTarget): array
    {
        if ($this->isVideo($post)) {
            return [$reelsTarget, $reelsTarget];
        }

        return [$simpleTarget, 0];
    }

    private function dripFor(int $likeTarget, int $viewTarget): int
    {
        $cap = max($likeTarget, $viewTarget);

        if ($cap <= 0) {
            return 1;
        }

        return max(1, min(self::MAX_DRIP, (int) ceil($cap / 10)));
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
    private function underTargetQuery(int $reelsTarget, int $simpleTarget): Builder
    {
        return Post::query()
            ->whereNotNull('published_at')
            ->where('visibility', PostVisibilityEnum::Public)
            ->where('status', PostStatusEnum::Ready)
            ->where(function ($q) use ($reelsTarget, $simpleTarget) {
                $hasClause = false;

                if ($reelsTarget > 0) {
                    $q->where(function ($video) use ($reelsTarget) {
                        $video->where('type', PostTypeEnum::Video)
                            ->where(function ($targets) use ($reelsTarget) {
                                $targets->where('likes_count', '<', $reelsTarget)
                                    ->orWhere('views_count', '<', $reelsTarget);
                            });
                    });
                    $hasClause = true;
                }

                if ($simpleTarget > 0) {
                    $method = $hasClause ? 'orWhere' : 'where';
                    $q->{$method}(function ($simple) use ($simpleTarget) {
                        $simple->where('type', '!=', PostTypeEnum::Video)
                            ->where('likes_count', '<', $simpleTarget);
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
