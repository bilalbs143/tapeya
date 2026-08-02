<?php

namespace App\Services\Post;

use App\Enums\Post\PostReportReasonEnum;
use App\Enums\Post\PostShareChannelEnum;
use App\Events\PostLiked;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\PostReport;
use App\Models\PostSave;
use App\Models\PostShare;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PostInteractionService
{
    public function assertInteractable(Post $post): void
    {
        if ($post->status->isUnavailable()) {
            throw ValidationException::withMessages([
                'reel' => ['Post not found.'],
            ]);
        }
    }

    /**
     * @return array{liked: bool, likes_count: int}
     */
    public function like(Post $post, User $user): array
    {
        $wasCreated = false;

        DB::transaction(function () use ($post, $user, &$wasCreated) {
            $like = PostLike::query()->firstOrCreate([
                'post_id' => $post->id,
                'user_id' => $user->id,
            ]);

            $wasCreated = $like->wasRecentlyCreated;
            if ($wasCreated) {
                $post->increment('likes_count');
            }
        });

        $post->refresh();

        if ($wasCreated) {
            event(new PostLiked($post, $user));
        }

        return [
            'liked' => true,
            'likes_count' => (int) $post->likes_count,
        ];
    }

    /**
     * @return array{liked: bool, likes_count: int}
     */
    public function unlike(Post $post, User $user): array
    {
        DB::transaction(function () use ($post, $user) {
            $deleted = PostLike::query()
                ->where('post_id', $post->id)
                ->where('user_id', $user->id)
                ->delete();

            if ($deleted > 0 && $post->likes_count > 0) {
                $post->decrement('likes_count');
            }
        });

        $post->refresh();

        return [
            'liked' => false,
            'likes_count' => (int) $post->likes_count,
        ];
    }

    /**
     * @return array{saved: bool, saves_count: int}
     */
    public function save(Post $post, User $user): array
    {
        DB::transaction(function () use ($post, $user) {
            $created = PostSave::query()->firstOrCreate([
                'post_id' => $post->id,
                'user_id' => $user->id,
            ]);

            if ($created->wasRecentlyCreated) {
                $post->increment('saves_count');
            }
        });

        $post->refresh();

        return [
            'saved' => true,
            'saves_count' => (int) $post->saves_count,
        ];
    }

    /**
     * @return array{saved: bool, saves_count: int}
     */
    public function unsave(Post $post, User $user): array
    {
        DB::transaction(function () use ($post, $user) {
            $deleted = PostSave::query()
                ->where('post_id', $post->id)
                ->where('user_id', $user->id)
                ->delete();

            if ($deleted > 0 && $post->saves_count > 0) {
                $post->decrement('saves_count');
            }
        });

        $post->refresh();

        return [
            'saved' => false,
            'saves_count' => (int) $post->saves_count,
        ];
    }

    /**
     * @return array{shares_count: int}
     */
    public function share(Post $post, ?User $user, string $channel): array
    {
        $channelEnum = PostShareChannelEnum::tryFrom($channel) ?? PostShareChannelEnum::Other;

        PostShare::query()->create([
            'post_id' => $post->id,
            'user_id' => $user?->id,
            'channel' => $channelEnum,
            'created_at' => now(),
        ]);

        $post->increment('shares_count');
        $post->refresh();

        return [
            'shares_count' => (int) $post->shares_count,
        ];
    }

    /**
     * @return array{reported: bool, reports_count: int}
     */
    public function report(Post $post, User $user, string $reason, ?string $details = null): array
    {
        $reasonEnum = PostReportReasonEnum::tryFrom($reason);
        if (! $reasonEnum) {
            throw ValidationException::withMessages([
                'reason' => ['Invalid report reason.'],
            ]);
        }

        if ($post->user_id === $user->id) {
            throw ValidationException::withMessages([
                'reel' => ['You cannot report your own reel.'],
            ]);
        }

        $created = false;

        DB::transaction(function () use ($post, $user, $reasonEnum, $details, &$created) {
            $report = PostReport::query()->firstOrCreate(
                [
                    'post_id' => $post->id,
                    'reporter_id' => $user->id,
                ],
                [
                    'reason' => $reasonEnum,
                    'details' => $details,
                    'status' => 'open',
                ]
            );

            if ($report->wasRecentlyCreated) {
                $created = true;
                $post->increment('reports_count');
            }
        });

        $post->refresh();

        return [
            'reported' => true,
            'already_reported' => ! $created,
            'reports_count' => (int) $post->reports_count,
        ];
    }

    public function attachViewerState(Post $post, ?User $viewer): Post
    {
        if (! $viewer) {
            $post->setAttribute('viewer_liked', false);
            $post->setAttribute('viewer_saved', false);
            $post->setAttribute('viewer_following_creator', false);

            return $post;
        }

        $post->setAttribute(
            'viewer_liked',
            PostLike::query()->where('post_id', $post->id)->where('user_id', $viewer->id)->exists()
        );
        $post->setAttribute(
            'viewer_saved',
            PostSave::query()->where('post_id', $post->id)->where('user_id', $viewer->id)->exists()
        );
        $post->setAttribute(
            'viewer_following_creator',
            $post->user_id !== $viewer->id
                && UserFollow::query()
                    ->where('follower_id', $viewer->id)
                    ->where('followed_user_id', $post->user_id)
                    ->exists()
        );

        return $post;
    }

    /**
     * Batch-attach liked/saved/following flags for a list of reels.
     *
     * @param  iterable<int, Post>  $posts
     * @return iterable<int, Post>
     */
    public function attachViewerStateMany(iterable $posts, ?User $viewer): iterable
    {
        $list = collect($posts);
        if ($list->isEmpty() || ! $viewer) {
            foreach ($list as $post) {
                $this->attachViewerState($post, $viewer);
            }

            return $list;
        }

        $postIds = $list->pluck('id')->all();
        $creatorIds = $list->pluck('user_id')->unique()->values()->all();

        $likedIds = PostLike::query()
            ->where('user_id', $viewer->id)
            ->whereIn('post_id', $postIds)
            ->pluck('post_id')
            ->all();
        $savedIds = PostSave::query()
            ->where('user_id', $viewer->id)
            ->whereIn('post_id', $postIds)
            ->pluck('post_id')
            ->all();
        $followingIds = UserFollow::query()
            ->where('follower_id', $viewer->id)
            ->whereIn('followed_user_id', $creatorIds)
            ->pluck('followed_user_id')
            ->all();

        $likedSet = array_flip($likedIds);
        $savedSet = array_flip($savedIds);
        $followingSet = array_flip($followingIds);

        foreach ($list as $post) {
            $post->setAttribute('viewer_liked', isset($likedSet[$post->id]));
            $post->setAttribute('viewer_saved', isset($savedSet[$post->id]));
            $post->setAttribute(
                'viewer_following_creator',
                $post->user_id !== $viewer->id && isset($followingSet[$post->user_id])
            );
        }

        return $list;
    }
}
