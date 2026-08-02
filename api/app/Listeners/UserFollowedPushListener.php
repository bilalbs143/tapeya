<?php

namespace App\Listeners;

use App\Enums\Push\NotificationEventEnum;
use App\Events\UserFollowed;
use App\Services\Push\PushNotificationService;
use App\Support\Notifications\ActorLabel;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class UserFollowedPushListener implements ShouldQueue
{
    public string $queue = 'push-notifications';

    public function __construct(
        private readonly PushNotificationService $pushService,
    ) {}

    public function handle(UserFollowed $event): void
    {
        try {
            if ((int) $event->follower->id === (int) $event->followed->id) {
                return;
            }

            $this->pushService->dispatch(
                NotificationEventEnum::USER_FOLLOWED,
                [
                    'actor_name' => ActorLabel::for($event->follower),
                    'actor_id' => $event->follower->id,
                    'deep_link' => '/notification-center',
                ],
                (int) $event->followed->id,
            );
        } catch (\Throwable $e) {
            Log::error('UserFollowedPushListener failed', [
                'follower_id' => $event->follower->id ?? null,
                'followed_id' => $event->followed->id ?? null,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
