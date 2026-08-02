<?php

namespace App\Listeners;

use App\Enums\Push\NotificationEventEnum;
use App\Events\PostLiked;
use App\Services\Push\PushNotificationService;
use App\Support\Notifications\ActorLabel;
use App\Support\Post\PostPaths;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class PostLikedPushListener implements ShouldQueue
{
    public string $queue = 'push-notifications';

    public function __construct(
        private readonly PushNotificationService $pushService,
    ) {}

    public function handle(PostLiked $event): void
    {
        try {
            $post = $event->post;
            $actor = $event->actor;

            if ((int) $post->user_id === (int) $actor->id || $post->user_id === null) {
                return;
            }

            $this->pushService->dispatch(
                NotificationEventEnum::POST_LIKED,
                [
                    'post_id' => $post->id,
                    'deep_link' => PostPaths::deepLink($post),
                    'actor_id' => $actor->id,
                    'actor_name' => ActorLabel::for($actor),
                ],
                (int) $post->user_id,
            );
        } catch (\Throwable $e) {
            Log::error('PostLikedPushListener failed', [
                'post_id' => $event->post->id ?? null,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
