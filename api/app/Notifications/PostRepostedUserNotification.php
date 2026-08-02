<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use App\Support\Notifications\ActorLabel;
use App\Support\Post\PostPaths;
use Illuminate\Notifications\Notification;

class PostRepostedUserNotification extends Notification
{
    public function __construct(
        protected Post $original,
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
            'type' => 'post_reposted',
            'post_id' => $this->original->id,
            'deep_link' => PostPaths::deepLink($this->original),
            'actor_id' => $this->actor->id,
            'actor_name' => $actorName,
            'message' => 'Repost: '.$actorName.' reposted your post',
        ];
    }
}
