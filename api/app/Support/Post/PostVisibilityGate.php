<?php

namespace App\Support\Post;

use App\Enums\Post\PostVisibilityEnum;
use App\Models\Post;
use App\Models\UserFollow;

/**
 * Shared visibility rules for findVisible + nested repost_of redaction.
 * Does not re-query the post; uses an already-loaded model.
 */
final class PostVisibilityGate
{
    public static function viewerCanSee(Post $post, ?int $viewerId): bool
    {
        if ($post->status->isUnavailable()) {
            return false;
        }

        if ($viewerId !== null && (int) $post->user_id === $viewerId) {
            return true;
        }

        if ($post->published_at === null) {
            return false;
        }

        return match ($post->visibility) {
            PostVisibilityEnum::Public => true,
            PostVisibilityEnum::Followers => self::viewerFollowsCreator($viewerId, (int) $post->user_id),
            PostVisibilityEnum::Private => false,
            default => false,
        };
    }

    public static function viewerFollowsCreator(?int $viewerId, int $creatorId): bool
    {
        if ($viewerId === null) {
            return false;
        }

        return UserFollow::query()
            ->where('follower_id', $viewerId)
            ->where('followed_user_id', $creatorId)
            ->exists();
    }
}
