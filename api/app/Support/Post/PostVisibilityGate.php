<?php

namespace App\Support\Post;

use App\Models\Post;

/**
 * Access rules for findVisible + nested repost_of redaction.
 * Posts are public once published; only status / ownership gate viewing.
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

        return $post->published_at !== null;
    }
}
