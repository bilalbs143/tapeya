<?php

namespace App\Listeners;

use App\Enums\Post\PostVisibilityEnum;
use App\Enums\Push\NotificationEventEnum;
use App\Events\PostPublished;
use App\Models\UserFollow;
use App\Services\Push\PushNotificationService;
use App\Support\Notifications\ActorLabel;
use App\Support\Post\PostPaths;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class PostPublishedPushListener implements ShouldQueue
{
    public string $queue = 'push-notifications';

    public function __construct(
        private readonly PushNotificationService $pushService,
    ) {}

    public function handle(PostPublished $event): void
    {
        try {
            $post = $event->post->fresh() ?? $event->post;
            $visibility = $post->visibility instanceof PostVisibilityEnum
                ? $post->visibility
                : PostVisibilityEnum::tryFrom((string) $post->visibility);

            if ($visibility === PostVisibilityEnum::Private || $post->user_id === null) {
                return;
            }

            $post->loadMissing('user');
            $creator = $post->user;
            if (! $creator) {
                return;
            }

            $followerIds = UserFollow::query()
                ->where('followed_user_id', $creator->id)
                ->pluck('follower_id');

            if ($followerIds->isEmpty()) {
                return;
            }

            $payload = [
                'post_id' => $post->id,
                'deep_link' => PostPaths::deepLink($post),
                'actor_id' => $creator->id,
                'actor_name' => ActorLabel::for($creator),
            ];

            foreach ($followerIds as $followerId) {
                $this->pushService->dispatch(
                    NotificationEventEnum::POST_PUBLISHED,
                    $payload,
                    (int) $followerId,
                );
            }
        } catch (\Throwable $e) {
            Log::error('PostPublishedPushListener failed', [
                'post_id' => $event->post->id ?? null,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
