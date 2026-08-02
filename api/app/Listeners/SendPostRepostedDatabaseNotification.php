<?php

namespace App\Listeners;

use App\Events\PostReposted;
use App\Notifications\PostRepostedUserNotification;
use Illuminate\Support\Facades\Log;

/**
 * Sync DB notification so Reverb can broadcast the badge update immediately.
 */
class SendPostRepostedDatabaseNotification
{
    public function handle(PostReposted $event): void
    {
        try {
            $original = $event->original;
            $actor = $event->actor;

            if ((int) $original->user_id === (int) $actor->id) {
                return;
            }

            $original->loadMissing('user');
            $owner = $original->user;
            if (! $owner) {
                return;
            }

            $owner->notify(new PostRepostedUserNotification($original, $actor));
        } catch (\Throwable $e) {
            Log::error('SendPostRepostedDatabaseNotification failed', [
                'post_id' => $event->original->id ?? null,
                'error' => $e->getMessage(),
            ]);
            report($e);
        }
    }
}
