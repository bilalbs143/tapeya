<?php

namespace App\Services\Post;

use App\Enums\Post\PostStatusEnum;
use App\Models\Post;
use App\Models\User;
use App\Models\UserFollow;
use App\Services\Safety\UserBlockService;
use App\Support\Post\PostVisibilityGate;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Database\Eloquent\Builder;

class PostFeedService
{
    /**
     * @return list<string>
     */
    private static function withRelations(): array
    {
        return [
            User::socialSummaryWith(),
            'hashtags:id,name',
            'video',
            'media',
            'latestComment',
            User::socialSummaryWith('latestComment.user'),
            User::socialSummaryWith('repostOf.user'),
            'repostOf.video',
        ];
    }

    /**
     * Hide authors the viewer has blocked (Guideline 1.2 — instant feed removal).
     *
     * @param  Builder<Post>  $query
     * @return Builder<Post>
     */
    private function excludeBlockedAuthors(Builder $query, ?int $viewerId): Builder
    {
        if (! $viewerId) {
            return $query;
        }

        $blockedIds = app(UserBlockService::class)->blockedUserIdsFor($viewerId);
        if ($blockedIds === []) {
            return $query;
        }

        return $query->whereNotIn('user_id', $blockedIds);
    }

    /**
     * @return CursorPaginator<int, Post>
     */
    public function explore(?string $cursor, int $perPage = 10, bool $videosOnly = false, ?int $viewerId = null): CursorPaginator
    {
        $perPage = max(1, min($perPage, 20));

        $query = Post::query()->explore();
        if ($videosOnly) {
            $query->videosOnly();
        }
        $this->excludeBlockedAuthors($query, $viewerId);

        return $query
            ->with(self::withRelations())
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->cursorPaginate($perPage, ['*'], 'cursor', $cursor);
    }

    /**
     * Following feed — published posts from accounts the viewer follows.
     *
     * @return CursorPaginator<int, Post>
     */
    public function following(int $viewerId, ?string $cursor, int $perPage = 10, bool $videosOnly = false): CursorPaginator
    {
        $perPage = max(1, min($perPage, 20));

        $followedIds = UserFollow::query()
            ->where('follower_id', $viewerId)
            ->pluck('followed_user_id');

        $query = Post::query()
            ->followingFeed()
            ->whereIn('user_id', $followedIds);
        $this->excludeBlockedAuthors($query, $viewerId);

        if ($videosOnly) {
            $query->videosOnly();
        }

        return $query
            ->with(self::withRelations())
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->cursorPaginate($perPage, ['*'], 'cursor', $cursor);
    }

    /**
     * @return CursorPaginator<int, Post>
     */
    public function trending(?string $cursor, int $perPage = 10, int $windowHours = 48, ?int $viewerId = null): CursorPaginator
    {
        $perPage = max(1, min($perPage, 20));

        $query = Post::query()
            ->explore()
            ->videosOnly()
            ->where('published_at', '>=', now()->subHours($windowHours));
        $this->excludeBlockedAuthors($query, $viewerId);

        return $query
            ->with(self::withRelations())
            ->orderByRaw('(likes_count * 3 + comments_count * 4 + shares_count * 5 + views_count * 0.1) DESC')
            ->orderByDesc('id')
            ->cursorPaginate($perPage, ['*'], 'cursor', $cursor);
    }

    /**
     * @return CursorPaginator<int, Post>
     */
    public function search(string $query, ?string $cursor, int $perPage = 10, ?int $viewerId = null): CursorPaginator
    {
        $perPage = max(1, min($perPage, 20));
        $q = trim($query);
        $tag = ltrim(mb_strtolower($q), '#');

        $builder = Post::query()
            ->explore()
            ->videosOnly()
            ->where(function ($inner) use ($q, $tag) {
                $inner->where('body', 'ilike', '%'.$q.'%');
                if ($tag !== '') {
                    $inner->orWhereHas('hashtags', function ($h) use ($tag) {
                        $h->where('name', 'ilike', $tag.'%');
                    });
                }
            });
        $this->excludeBlockedAuthors($builder, $viewerId);

        return $builder
            ->with(self::withRelations())
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->cursorPaginate($perPage, ['*'], 'cursor', $cursor);
    }

    /**
     * @return CursorPaginator<int, Post>
     */
    public function forHashtag(string $name, ?string $cursor, int $perPage = 10, ?int $viewerId = null): CursorPaginator
    {
        $perPage = max(1, min($perPage, 20));
        $tag = ltrim(mb_strtolower(trim($name)), '#');

        $query = Post::query()
            ->explore()
            ->videosOnly()
            ->whereHas('hashtags', fn ($h) => $h->where('name', $tag));
        $this->excludeBlockedAuthors($query, $viewerId);

        return $query
            ->with(self::withRelations())
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->cursorPaginate($perPage, ['*'], 'cursor', $cursor);
    }

    /**
     * Owner's posts (Mine / My Videos).
     * /reels/mine passes videosOnly; /feed/mine passes false for mixed types.
     *
     * @return CursorPaginator<int, Post>
     */
    public function mine(int $userId, ?string $cursor, int $perPage = 10, bool $videosOnly = true): CursorPaginator
    {
        $perPage = max(1, min($perPage, 20));

        $query = Post::query()->ownedBy($userId);

        if ($videosOnly) {
            $query->videosOnly();
        }

        return $query
            ->whereNotIn('status', [
                PostStatusEnum::Uploading,
                PostStatusEnum::Removed,
            ])
            ->with(self::withRelations())
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->cursorPaginate($perPage, ['*'], 'cursor', $cursor);
    }

    /**
     * Saved (bookmarked) posts for the viewer.
     * Default videosOnly keeps /reels/saved unchanged; Home feed passes false for mixed types.
     *
     * @return CursorPaginator<int, Post>
     */
    public function saved(int $userId, ?string $cursor, int $perPage = 10, bool $videosOnly = true): CursorPaginator
    {
        $perPage = max(1, min($perPage, 20));

        $query = Post::query()
            ->explore()
            ->whereHas('saves', fn ($q) => $q->where('user_id', $userId));
        $this->excludeBlockedAuthors($query, $userId);

        if ($videosOnly) {
            $query->videosOnly();
        }

        return $query
            ->with(self::withRelations())
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->cursorPaginate($perPage, ['*'], 'cursor', $cursor);
    }

    /**
     * Profile grid: published reels (processing + ready).
     * $viewerId retained for call-site compatibility; posts are always public when published.
     *
     * @return CursorPaginator<int, Post>
     */
    public function forUser(int $userId, ?int $viewerId, ?string $cursor, int $perPage = 10): CursorPaginator
    {
        $perPage = max(1, min($perPage, 20));

        return $this->profileReelsQuery($userId)
            ->with(self::withRelations())
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->cursorPaginate($perPage, ['*'], 'cursor', $cursor);
    }

    /**
     * Profile list: published non-video posts.
     * $viewerId retained for call-site compatibility; posts are always public when published.
     *
     * @return CursorPaginator<int, Post>
     */
    public function forUserPosts(int $userId, ?int $viewerId, ?string $cursor, int $perPage = 10): CursorPaginator
    {
        $perPage = max(1, min($perPage, 20));

        return $this->profilePostsQuery($userId)
            ->with(self::withRelations())
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->cursorPaginate($perPage, ['*'], 'cursor', $cursor);
    }

    /**
     * Same publish/status rules as {@see forUser}, for the profile reels_count badge.
     */
    public function countForUser(int $userId, ?int $viewerId = null): int
    {
        return $this->profileReelsQuery($userId)->count();
    }

    /**
     * Same publish/status rules as {@see forUserPosts}, for the profile posts_count badge.
     */
    public function countPostsForUser(int $userId, ?int $viewerId = null): int
    {
        return $this->profilePostsQuery($userId)->count();
    }

    /**
     * @return Builder<Post>
     */
    private function profileReelsQuery(int $userId)
    {
        return $this->profilePublishedQuery($userId)->videosOnly();
    }

    /**
     * @return Builder<Post>
     */
    private function profilePostsQuery(int $userId)
    {
        return $this->profilePublishedQuery($userId)->nonVideos();
    }

    /**
     * @return Builder<Post>
     */
    private function profilePublishedQuery(int $userId)
    {
        return Post::query()
            ->ownedBy($userId)
            ->whereNotNull('published_at')
            ->whereNotIn('status', [
                PostStatusEnum::Uploading,
                PostStatusEnum::Failed,
                PostStatusEnum::Rejected,
                PostStatusEnum::Removed,
            ]);
    }

    public function findVisible(int $postId, ?int $viewerId = null): ?Post
    {
        /** @var Post|null $post */
        $post = Post::query()
            ->with(self::withRelations())
            ->find($postId);

        if (! $post) {
            return null;
        }

        return PostVisibilityGate::viewerCanSee($post, $viewerId) ? $post : null;
    }
}
