<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\PostComment;
use App\Models\User;
use App\Support\Notifications\ActorLabel;
use App\Support\Post\PostPaths;
use Illuminate\Notifications\Notification;

class PostCommentReplyUserNotification extends Notification
{
    public function __construct(
        protected Post $post,
        protected PostComment $comment,
        protected User $actor,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $actorName = ActorLabel::for($this->actor);

        return [
            'type' => 'post_comment_reply',
            'post_id' => $this->post->id,
            'comment_id' => $this->comment->id,
            'parent_id' => $this->comment->parent_id,
            'deep_link' => PostPaths::deepLink($this->post),
            'actor_id' => $this->actor->id,
            'actor_name' => $actorName,
            'message' => 'New reply: '.$actorName.' replied to your comment',
        ];
    }
}
