<?php

namespace App\Listeners;

use App\Enums\Post\PostStatusEnum;
use App\Events\PostPublished;
use App\Services\Post\PostCaptionMentionNotifier;
use App\Services\Post\PostMentionSync;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Persist caption @mentions and notify newly mentioned users when a post goes live.
 */
class SendPostCaptionMentionNotifications implements ShouldQueue
{
    public function handle(PostPublished $event): void
    {
        try {
            $post = $event->post->fresh(['user']) ?? $event->post;
            if ($post->user_id === null) {
                return;
            }

            $status = $post->status instanceof PostStatusEnum
                ? $post->status
                : PostStatusEnum::tryFrom((string) $post->status);
            if ($status !== PostStatusEnum::Ready) {
                return;
            }

            $newIds = app(PostMentionSync::class)->syncForPost($post);
            if ($newIds === []) {
                return;
            }

            $post->loadMissing('user');
            $actor = $post->user;
            if (! $actor) {
                return;
            }

            app(PostCaptionMentionNotifier::class)->notifyNewMentions($post, $actor, $newIds);
        } catch (\Throwable $e) {
            Log::error('SendPostCaptionMentionNotifications failed', [
                'post_id' => $event->post->id ?? null,
                'error' => $e->getMessage(),
            ]);
            report($e);
        }
    }
}
