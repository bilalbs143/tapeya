<?php

namespace App\Services\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\Post\PostVisibilityEnum;
use App\Events\PostPublished;
use App\Events\PostReposted;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PostRepostService
{
    /**
     * Create a feed repost pointing at the root original (unwrap chains).
     *
     * @param  array{body?: string|null, visibility?: string|null}  $data
     */
    public function repost(User $actor, Post $target, array $data = []): Post
    {
        $visible = app(PostFeedService::class)->findVisible((int) $target->id, (int) $actor->id);
        if (! $visible) {
            throw ValidationException::withMessages([
                'post' => ['You cannot repost this content.'],
            ]);
        }

        $original = $this->rootOriginal($visible);

        if ($original->user_id === $actor->id && $original->id === $visible->id && $visible->type !== PostTypeEnum::Repost) {
            // Allow quoting own posts; still fine.
        }

        $requested = PostVisibilityEnum::tryFrom($data['visibility'] ?? '')
            ?? PostVisibilityEnum::Public;
        $originalVisibility = $original->visibility instanceof PostVisibilityEnum
            ? $original->visibility
            : PostVisibilityEnum::tryFrom((string) $original->visibility) ?? PostVisibilityEnum::Public;
        $visibility = $requested->capTo($originalVisibility);

        $body = isset($data['body']) ? trim((string) $data['body']) : null;
        if ($body === '') {
            $body = null;
        }

        $repost = DB::transaction(function () use ($actor, $original, $body, $visibility) {
            $repost = Post::query()->create([
                'user_id' => $actor->id,
                'type' => PostTypeEnum::Repost,
                'body' => $body,
                'status' => PostStatusEnum::Ready,
                'visibility' => $visibility,
                'repost_of_post_id' => $original->id,
                'published_at' => now(),
            ]);

            Post::query()->whereKey($original->id)->update([
                'reposts_count' => DB::raw('COALESCE(reposts_count, 0) + 1'),
            ]);

            User::query()->whereKey($actor->id)->update([
                'posts_count' => DB::raw('COALESCE(posts_count, 0) + 1'),
            ]);

            return $repost;
        });

        app(PostHashtagParser::class)->syncForPost($repost);

        $repost->load(['user', 'repostOf']);
        event(new PostPublished($repost));
        event(new PostReposted($original, $repost, $actor));

        return $repost->fresh(['user', 'repostOf.user', 'repostOf.video', 'hashtags']) ?? $repost;
    }

    public function rootOriginal(Post $post): Post
    {
        $current = $post;
        $guard = 0;
        while ($current->type === PostTypeEnum::Repost && $current->repost_of_post_id && $guard < 10) {
            $next = Post::query()->find($current->repost_of_post_id);
            if (! $next) {
                break;
            }
            $current = $next;
            $guard++;
        }

        if ($current->type === PostTypeEnum::Repost && $current->repost_of_post_id) {
            throw ValidationException::withMessages([
                'post' => ['This repost chain is invalid or too deep.'],
            ]);
        }

        return $current;
    }
}
