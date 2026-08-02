<?php

namespace App\Services\Post;

use App\Enums\Push\NotificationEventEnum;
use App\Models\Post;
use App\Models\User;
use App\Notifications\PostMentionedUserNotification;
use App\Services\Push\PushNotificationService;
use App\Support\Notifications\ActorLabel;
use App\Support\Post\PostPaths;
use App\Support\Post\PostVisibilityGate;
use Illuminate\Support\Facades\Log;

/**
 * Notify newly @mentioned users from a post caption (DB + push).
 */
class PostCaptionMentionNotifier
{
    public function __construct(
        private readonly PushNotificationService $pushService,
    ) {}

    /**
     * @param  list<int>  $mentionedUserIds
     */
    public function notifyNewMentions(Post $post, User $actor, array $mentionedUserIds): void
    {
        if ($mentionedUserIds === []) {
            return;
        }

        $actorId = (int) $actor->id;
        $deepLink = PostPaths::deepLink($post);
        $actorName = ActorLabel::for($actor);

        $users = User::query()
            ->whereIn('id', $mentionedUserIds)
            ->get(['id', 'name', 'nickname', 'avatar']);

        foreach ($users as $user) {
            $userId = (int) $user->id;
            if ($userId === $actorId) {
                continue;
            }

            if (! PostVisibilityGate::viewerCanSee($post, $userId)) {
                continue;
            }

            try {
                $user->notify(new PostMentionedUserNotification($post, null, $actor));
            } catch (\Throwable $e) {
                Log::error('Post caption mention DB notification failed', [
                    'post_id' => $post->id,
                    'user_id' => $userId,
                    'error' => $e->getMessage(),
                ]);
                report($e);
            }

            try {
                $this->pushService->dispatch(
                    NotificationEventEnum::POST_MENTIONED,
                    [
                        'post_id' => $post->id,
                        'deep_link' => $deepLink,
                        'actor_id' => $actorId,
                        'actor_name' => $actorName,
                        'mention_source' => 'post',
                    ],
                    $userId,
                );
            } catch (\Throwable $e) {
                Log::error('Post caption mention push failed', [
                    'post_id' => $post->id,
                    'user_id' => $userId,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
