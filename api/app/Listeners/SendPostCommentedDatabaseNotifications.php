<?php

namespace App\Listeners;

use App\Events\PostCommented;
use App\Models\User;
use App\Notifications\PostCommentedUserNotification;
use App\Notifications\PostCommentReplyUserNotification;
use App\Notifications\PostMentionedUserNotification;
use App\Support\Post\PostMentionParser;
use Illuminate\Support\Facades\Log;

/**
 * Sync DB notifications for @mentions / parent author / post owner.
 *
 * Mentions take priority when one user qualifies for multiple notifications.
 */
class SendPostCommentedDatabaseNotifications
{
    public function handle(PostCommented $event): void
    {
        try {
            $post = $event->post;
            $comment = $event->comment;
            $actor = $event->actor;
            $notifiedUserIds = [(int) $actor->id];

            foreach (PostMentionParser::resolveUsers((string) $comment->body) as $user) {
                if (in_array((int) $user->id, $notifiedUserIds, true)) {
                    continue;
                }
                $user->notify(new PostMentionedUserNotification($post, $comment, $actor));
                $notifiedUserIds[] = (int) $user->id;
            }

            if ($comment->parent_id !== null) {
                $parent = $comment->relationLoaded('parent')
                    ? $comment->parent
                    : $comment->parent()->first();

                if ($parent && ! in_array((int) $parent->user_id, $notifiedUserIds, true)) {
                    $parentAuthor = User::query()->find($parent->user_id);
                    if ($parentAuthor) {
                        $parentAuthor->notify(new PostCommentReplyUserNotification($post, $comment, $actor));
                        $notifiedUserIds[] = (int) $parentAuthor->id;
                    }
                }
            } elseif (
                (int) $post->user_id !== (int) $actor->id
                && ! in_array((int) $post->user_id, $notifiedUserIds, true)
            ) {
                $owner = $post->relationLoaded('user') ? $post->user : $post->user()->first();
                if ($owner) {
                    $owner->notify(new PostCommentedUserNotification($post, $comment, $actor));
                    $notifiedUserIds[] = (int) $owner->id;
                }
            }
        } catch (\Throwable $e) {
            Log::error('SendPostCommentedDatabaseNotifications failed', [
                'post_id' => $event->post->id ?? null,
                'comment_id' => $event->comment->id ?? null,
                'error' => $e->getMessage(),
            ]);
            report($e);
        }
    }
}
