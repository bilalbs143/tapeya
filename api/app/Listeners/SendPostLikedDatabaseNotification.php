<?php

namespace App\Listeners;

use App\Events\PostLiked;
use App\Notifications\PostLikedUserNotification;
use Illuminate\Support\Facades\Log;

/**
 * Sync DB notification so Reverb can broadcast the badge update immediately.
 */
class SendPostLikedDatabaseNotification
{
    public function handle(PostLiked $event): void
    {
        try {
            $post = $event->post;
            $actor = $event->actor;

            if ((int) $post->user_id === (int) $actor->id) {
                return;
            }

            $post->loadMissing('user');
            $owner = $post->user;
            if (! $owner) {
                return;
            }

            $owner->notify(new PostLikedUserNotification($post, $actor));
        } catch (\Throwable $e) {
            Log::error('SendPostLikedDatabaseNotification failed', [
                'post_id' => $event->post->id ?? null,
                'error' => $e->getMessage(),
            ]);
            report($e);
        }
    }
}
