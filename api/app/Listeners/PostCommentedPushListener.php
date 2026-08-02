<?php

namespace App\Listeners;

use App\Enums\Push\NotificationEventEnum;
use App\Events\PostCommented;
use App\Services\Push\PushNotificationService;
use App\Support\Notifications\ActorLabel;
use App\Support\Post\PostMentionParser;
use App\Support\Post\PostPaths;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class PostCommentedPushListener implements ShouldQueue
{
    public string $queue = 'push-notifications';

    public function __construct(
        private readonly PushNotificationService $pushService,
    ) {}

    public function handle(PostCommented $event): void
    {
        try {
            $post = $event->post;
            $comment = $event->comment;
            $actor = $event->actor;
            $actorName = ActorLabel::for($actor);
            $deepLink = PostPaths::deepLink($post);
            $notifiedUserIds = [(int) $actor->id];

            $base = [
                'post_id' => $post->id,
                'comment_id' => $comment->id,
                'deep_link' => $deepLink,
                'actor_id' => $actor->id,
                'actor_name' => $actorName,
            ];

            foreach (PostMentionParser::resolveUsers((string) $comment->body) as $user) {
                $userId = (int) $user->id;
                if (in_array($userId, $notifiedUserIds, true)) {
                    continue;
                }
                $this->pushService->dispatch(
                    NotificationEventEnum::POST_MENTIONED,
                    $base + ['mention_source' => 'comment'],
                    $userId,
                );
                $notifiedUserIds[] = $userId;
            }

            if ($comment->parent_id !== null) {
                $parent = $comment->relationLoaded('parent')
                    ? $comment->parent
                    : $comment->parent()->first();

                if ($parent && ! in_array((int) $parent->user_id, $notifiedUserIds, true)) {
                    $this->pushService->dispatch(
                        NotificationEventEnum::POST_COMMENT_REPLY,
                        $base + ['parent_id' => $parent->id],
                        (int) $parent->user_id,
                    );
                    $notifiedUserIds[] = (int) $parent->user_id;
                }
            } elseif (
                (int) $post->user_id !== (int) $actor->id
                && $post->user_id !== null
                && ! in_array((int) $post->user_id, $notifiedUserIds, true)
            ) {
                $this->pushService->dispatch(
                    NotificationEventEnum::POST_COMMENTED,
                    $base,
                    (int) $post->user_id,
                );
                $notifiedUserIds[] = (int) $post->user_id;
            }
        } catch (\Throwable $e) {
            Log::error('PostCommentedPushListener failed', [
                'post_id' => $event->post->id ?? null,
                'comment_id' => $event->comment->id ?? null,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
