<?php

namespace App\Notifications;

use App\Enums\Post\PostTypeEnum;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\User;
use App\Support\Notifications\ActorLabel;
use App\Support\Post\PostPaths;
use Illuminate\Notifications\Notification;

class PostCommentedUserNotification extends Notification
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
        $contentType = $this->post->type === PostTypeEnum::Video ? 'reel' : 'post';

        return [
            'type' => 'post_commented',
            'post_id' => $this->post->id,
            'comment_id' => $this->comment->id,
            'deep_link' => PostPaths::deepLink($this->post),
            'actor_id' => $this->actor->id,
            'actor_name' => $actorName,
            // Inbox clients bold `actor_name`; keep verb phrase only.
            'message' => 'New comment: commented on your '.$contentType,
        ];
    }
}
