<?php

namespace App\Support\Post;

use App\Enums\Post\PostTypeEnum;
use App\Models\Post;

/**
 * In-app post paths (keep in sync with app deepLinkRegistry).
 */
final class PostPaths
{
    public static function deepLink(Post|int|string $post): string
    {
        if (! $post instanceof Post) {
            // Backward-compatible fallback for callers that only know a reel id.
            return '/reels/'.$post;
        }

        return $post->type === PostTypeEnum::Video
            ? '/reels/'.$post->id
            : '/feed/'.$post->id;
    }
}
