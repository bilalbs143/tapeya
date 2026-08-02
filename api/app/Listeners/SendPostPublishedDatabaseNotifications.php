<?php

namespace App\Listeners;

use App\Enums\Post\PostVisibilityEnum;
use App\Events\PostPublished;
use App\Models\User;
use App\Models\UserFollow;
use App\Notifications\PostPublishedFollowerNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Notify each follower when someone they follow publishes a reel.
 * Queued so upload is not blocked by fan-out.
 */
class SendPostPublishedDatabaseNotifications implements ShouldQueue
{
    public function handle(PostPublished $event): void
    {
        try {
            $post = $event->post->fresh() ?? $event->post;
            $visibility = $post->visibility instanceof PostVisibilityEnum
                ? $post->visibility
                : PostVisibilityEnum::tryFrom((string) $post->visibility);

            if ($visibility === PostVisibilityEnum::Private || $post->user_id === null) {
                return;
            }

            $post->loadMissing('user');
            $creator = $post->user;
            if (! $creator) {
                return;
            }

            $followerIds = UserFollow::query()
                ->where('followed_user_id', $creator->id)
                ->pluck('follower_id');

            if ($followerIds->isEmpty()) {
                return;
            }

            User::query()
                ->whereIn('id', $followerIds)
                ->orderBy('id')
                ->chunkById(100, function ($followers) use ($post, $creator): void {
                    foreach ($followers as $follower) {
                        $follower->notify(new PostPublishedFollowerNotification($post, $creator));
                    }
                });
        } catch (\Throwable $e) {
            Log::error('SendPostPublishedDatabaseNotifications failed', [
                'post_id' => $event->post->id ?? null,
                'error' => $e->getMessage(),
            ]);
            report($e);
        }
    }
}
