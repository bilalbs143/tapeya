<?php

namespace App\Listeners;

use App\Enums\Push\NotificationEventEnum;
use App\Events\PostCommentLiked;
use App\Services\Push\PushNotificationService;
use App\Support\Notifications\ActorLabel;
use App\Support\Post\PostPaths;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class PostCommentLikedPushListener implements ShouldQueue
{
    public string $queue = 'push-notifications';

    public function __construct(
        private readonly PushNotificationService $pushService,
    ) {}

    public function handle(PostCommentLiked $event): void
    {
        try {
            $post = $event->post;
            $comment = $event->comment;
            $actor = $event->actor;

            if ((int) $comment->user_id === (int) $actor->id || $comment->user_id === null) {
                return;
            }

            $this->pushService->dispatch(
                NotificationEventEnum::POST_COMMENT_LIKED,
                [
                    'post_id' => $post->id,
                    'comment_id' => $comment->id,
                    'deep_link' => PostPaths::deepLink($post),
                    'actor_id' => $actor->id,
                    'actor_name' => ActorLabel::for($actor),
                ],
                (int) $comment->user_id,
            );
        } catch (\Throwable $e) {
            Log::error('PostCommentLikedPushListener failed', [
                'post_id' => $event->post->id ?? null,
                'comment_id' => $event->comment->id ?? null,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
