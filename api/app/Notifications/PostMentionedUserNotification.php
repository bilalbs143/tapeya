<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\PostComment;
use App\Models\User;
use App\Support\Notifications\ActorLabel;
use App\Support\Post\PostPaths;
use Illuminate\Notifications\Notification;

class PostMentionedUserNotification extends Notification
{
    public function __construct(
        protected Post $post,
        protected ?PostComment $comment,
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
        $inComment = $this->comment !== null;

        return [
            'type' => 'post_mentioned',
            'post_id' => $this->post->id,
            'comment_id' => $this->comment?->id,
            'deep_link' => PostPaths::deepLink($this->post),
            'actor_id' => $this->actor->id,
            'actor_name' => $actorName,
            'message' => $inComment
                ? 'Mention: '.$actorName.' mentioned you in a comment'
                : 'Mention: '.$actorName.' mentioned you in a post',
        ];
    }
}
