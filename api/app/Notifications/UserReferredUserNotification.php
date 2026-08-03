<?php

namespace App\Notifications;

use App\Models\User;
use App\Support\Notifications\ActorLabel;
use Illuminate\Notifications\Notification;

class UserReferredUserNotification extends Notification
{
    public function __construct(
        protected User $referred,
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
        $actorName = ActorLabel::for($this->referred);

        return [
            'type' => 'user_referred',
            'actor_id' => $this->referred->id,
            'actor_name' => $actorName,
            'deep_link' => '/notification-center',
            'message' => 'New referral: '.$actorName.' joined using your nickname',
        ];
    }
}
