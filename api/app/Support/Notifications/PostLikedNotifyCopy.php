<?php

namespace App\Support\Notifications;

use App\Enums\Post\PostTypeEnum;
use App\Models\Post;
use App\Models\User;
use App\Support\Post\PostPaths;

/**
 * Shared copy + push vars for instant real likes and combined auto-like digests.
 */
final class PostLikedNotifyCopy
{
    public static function contentType(Post $post): string
    {
        return $post->type === PostTypeEnum::Video ? 'video' : 'post';
    }

    public static function othersClause(int $othersCount): string
    {
        $others = max(0, $othersCount);

        return $others > 0 ? ' and '.$others.' others' : '';
    }

    public static function message(Post $post, User $actor, int $othersCount = 0): string
    {
        $actorName = ActorLabel::for($actor);
        $others = max(0, $othersCount);
        $who = $others > 0
            ? $actorName.' and '.$others.' others'
            : $actorName;

        return $who.' liked your '.self::contentType($post);
    }

    /**
     * @return array{
     *     post_id: int|string|null,
     *     deep_link: string,
     *     actor_id: int|string|null,
     *     actor_name: string,
     *     others_count: int,
     *     others_clause: string,
     *     content_type: string
     * }
     */
    public static function pushVars(Post $post, User $actor, int $othersCount = 0): array
    {
        $others = max(0, $othersCount);

        return [
            'post_id' => $post->id,
            'deep_link' => PostPaths::deepLink($post),
            'actor_id' => $actor->id,
            'actor_name' => ActorLabel::for($actor),
            'others_count' => $others,
            'others_clause' => self::othersClause($others),
            'content_type' => self::contentType($post),
        ];
    }
}
