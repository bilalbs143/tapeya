<?php

namespace App\Listeners;

use App\Enums\Push\NotificationEventEnum;
use App\Events\UserReferred;
use App\Services\Push\PushNotificationService;
use App\Support\Notifications\ActorLabel;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class UserReferredPushListener implements ShouldQueue
{
    public string $queue = 'push-notifications';

    public function __construct(
        private readonly PushNotificationService $pushService,
    ) {}

    public function handle(UserReferred $event): void
    {
        try {
            if ((int) $event->referrer->id === (int) $event->referred->id) {
                return;
            }

            $this->pushService->dispatch(
                NotificationEventEnum::USER_REFERRED,
                [
                    'actor_name' => ActorLabel::for($event->referred),
                    'actor_id' => $event->referred->id,
                    'deep_link' => '/notification-center',
                ],
                (int) $event->referrer->id,
            );
        } catch (\Throwable $e) {
            Log::error('UserReferredPushListener failed', [
                'referrer_id' => $event->referrer->id ?? null,
                'referred_id' => $event->referred->id ?? null,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
