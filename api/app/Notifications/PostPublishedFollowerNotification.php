<?php

namespace App\Notifications;

use App\Enums\Post\PostTypeEnum;
use App\Models\Post;
use App\Models\User;
use App\Support\Notifications\ActorLabel;
use App\Support\Post\PostPaths;
use Illuminate\Notifications\Notification;

class PostPublishedFollowerNotification extends Notification
{
    public function __construct(
        protected Post $post,
        protected User $creator,
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
        $actorName = ActorLabel::for($this->creator);
        $contentType = $this->post->type === PostTypeEnum::Video ? 'reel' : 'post';

        return [
            'type' => 'post_published',
            'post_id' => $this->post->id,
            'deep_link' => PostPaths::deepLink($this->post),
            'actor_id' => $this->creator->id,
            'actor_name' => $actorName,
            'message' => 'New '.$contentType.': '.$actorName.' posted a new '.$contentType,
        ];
    }
}
