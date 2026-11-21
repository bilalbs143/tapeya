<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use App\Support\Notifications\ActorLabel;
use App\Support\Notifications\PostLikedNotifyCopy;
use App\Support\Post\PostPaths;
use Illuminate\Notifications\Notification;

class PostLikedUserNotification extends Notification
{
    public function __construct(
        protected Post $post,
        protected User $actor,
        protected int $othersCount = 0,
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
        $others = max(0, $this->othersCount);

        return [
            'type' => 'post_liked',
            'post_id' => $this->post->id,
            'deep_link' => PostPaths::deepLink($this->post),
            'actor_id' => $this->actor->id,
            'actor_name' => ActorLabel::for($this->actor),
            'others_count' => $others,
            'message' => PostLikedNotifyCopy::message($this->post, $this->actor, $others),
        ];
    }
}
