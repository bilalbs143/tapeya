<?php

namespace App\Listeners;

use App\Enums\Push\NotificationEventEnum;
use App\Events\PostReposted;
use App\Services\Push\PushNotificationService;
use App\Support\Notifications\ActorLabel;
use App\Support\Post\PostPaths;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class PostRepostedPushListener implements ShouldQueue
{
    public string $queue = 'push-notifications';

    public function __construct(
        private readonly PushNotificationService $pushService,
    ) {}

    public function handle(PostReposted $event): void
    {
        try {
            $original = $event->original;
            $actor = $event->actor;

            if ((int) $original->user_id === (int) $actor->id || $original->user_id === null) {
                return;
            }

            $this->pushService->dispatch(
                NotificationEventEnum::POST_REPOSTED,
                [
                    'post_id' => $original->id,
                    'deep_link' => PostPaths::deepLink($original),
                    'actor_id' => $actor->id,
                    'actor_name' => ActorLabel::for($actor),
                ],
                (int) $original->user_id,
            );
        } catch (\Throwable $e) {
            Log::error('PostRepostedPushListener failed', [
                'post_id' => $event->original->id ?? null,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
