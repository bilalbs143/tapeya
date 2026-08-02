<?php

namespace App\Services\User;

use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Support\Collection;

/**
 * Ranked "who to follow" candidates for the Explore feed widget.
 */
class UserSuggestionService
{
    public const DEFAULT_LIMIT = 20;

    public const MAX_LIMIT = 20;

    /**
     * @return Collection<int, User>
     */
    public function forViewer(User $viewer, int $limit = self::DEFAULT_LIMIT): Collection
    {
        $limit = max(1, min($limit, self::MAX_LIMIT));

        $followedIds = UserFollow::query()
            ->where('follower_id', $viewer->id)
            ->pluck('followed_user_id');

        return User::query()
            ->appUsers()
            ->active()
            ->where('id', '!=', $viewer->id)
            ->whereNotNull('nickname')
            ->where('nickname', '!=', '')
            ->when(
                $followedIds->isNotEmpty(),
                fn ($query) => $query->whereNotIn('id', $followedIds),
            )
            ->orderByDesc('is_official')
            ->orderByDesc('followers_count')
            ->orderByDesc('posts_count')
            ->orderByDesc('id')
            ->limit($limit)
            ->get([
                'id',
                'name',
                'nickname',
                'avatar',
                'is_official',
                'followers_count',
                'posts_count',
                'playing_role',
            ]);
    }
}
