<?php

namespace App\Listeners;

use App\Events\PostCommentLiked;
use App\Notifications\PostCommentLikedUserNotification;
use Illuminate\Support\Facades\Log;

/**
 * Sync DB notification so Reverb can broadcast the badge update immediately.
 */
class SendPostCommentLikedDatabaseNotification
{
    public function handle(PostCommentLiked $event): void
    {
        try {
            $comment = $event->comment;
            $actor = $event->actor;

            if ((int) $comment->user_id === (int) $actor->id) {
                return;
            }

            $comment->loadMissing('user');
            $author = $comment->user;
            if (! $author) {
                return;
            }

            $author->notify(new PostCommentLikedUserNotification($event->post, $comment, $actor));
        } catch (\Throwable $e) {
            Log::error('SendPostCommentLikedDatabaseNotification failed', [
                'post_id' => $event->post->id ?? null,
                'comment_id' => $event->comment->id ?? null,
                'error' => $e->getMessage(),
            ]);
            report($e);
        }
    }
}
