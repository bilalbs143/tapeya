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
 * Temporary growth helper: walk all public posts in id chunks, drip likes/views
 * from random active users. No extra tables.
 *
 * Chunk cursor lives in cache via {@see Cache::forever()} — no TTL, so it is not
 * time-expired. (A full cache flush still resets it to 0, which is safe: the walk
 * simply restarts from the lowest under-target id.)
 */
class AutoEngagementService
{
    /** Durable-until-flushed cursor; never use a TTL on this key. */
    public const CURSOR_CACHE_KEY = 'posts.auto_engagement.cursor_id';

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

        $likeTarget = max(0, min(50, (int) $this->settings->autoLikeCount));
        $viewTarget = max(0, min(200, (int) $this->settings->autoViewCount));
        $chunk = max(1, min(200, (int) $this->settings->autoEngagementPostsPerRun));
        $drip = max(1, min(5, (int) $this->settings->autoEngagementActionsPerPost));

        if ($likeTarget === 0 && $viewTarget === 0) {
            return 0;
        }

        if ($this->remainingUnderTargetCount($likeTarget, $viewTarget) === 0) {
            $this->resetCursor();

            return 0;
        }

        $cursor = $this->cursor();

        $posts = $this->underTargetQuery($likeTarget, $viewTarget)
            ->where('id', '>', $cursor)
            ->orderBy('id')
            ->limit($chunk)
            ->get();

        // End of catalog — wrap to first under-target chunk.
        if ($posts->isEmpty()) {
            $this->resetCursor();
            $posts = $this->underTargetQuery($likeTarget, $viewTarget)
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
            if ($this->dripEngagePost($post, $likeTarget, $viewTarget, $drip)) {
                $touched++;
            }
        }

        $this->storeCursor((int) $posts->last()->id);

        return $touched;
    }

    /** How many public posts still sit under like and/or view targets. */
    public function remainingUnderTargetCount(?int $likeTarget = null, ?int $viewTarget = null): int
    {
        $this->reloadSettings();
        $likeTarget ??= max(0, min(50, (int) $this->settings->autoLikeCount));
        $viewTarget ??= max(0, min(200, (int) $this->settings->autoViewCount));

        if ($likeTarget === 0 && $viewTarget === 0) {
            return 0;
        }

        return $this->underTargetQuery($likeTarget, $viewTarget)->count();
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
     * @return Builder<Post>
     */
    private function underTargetQuery(int $likeTarget, int $viewTarget): Builder
    {
        return Post::query()
            ->whereNotNull('published_at')
            ->where('visibility', PostVisibilityEnum::Public)
            ->where('status', PostStatusEnum::Ready)
            ->where(function ($q) use ($likeTarget, $viewTarget) {
                if ($likeTarget > 0) {
                    $q->where('likes_count', '<', $likeTarget);
                }
                if ($viewTarget > 0) {
                    $method = $likeTarget > 0 ? 'orWhere' : 'where';
                    $q->{$method}('views_count', '<', $viewTarget);
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
