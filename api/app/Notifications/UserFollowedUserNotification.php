<?php

namespace App\Notifications;

use App\Models\User;
use App\Support\Notifications\ActorLabel;
use Illuminate\Notifications\Notification;

class UserFollowedUserNotification extends Notification
{
    public function __construct(
        protected User $follower,
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
        $actorName = ActorLabel::for($this->follower);

        return [
            'type' => 'user_followed',
            'actor_id' => $this->follower->id,
            'actor_name' => $actorName,
            'deep_link' => '/notification-center',
            'message' => 'New follower: '.$actorName.' started following you',
        ];
    }
}
