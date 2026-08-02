<?php

namespace App\Listeners;

use App\Events\UserFollowed;
use App\Notifications\UserFollowedUserNotification;
use Illuminate\Support\Facades\Log;

class SendUserFollowedDatabaseNotification
{
    public function handle(UserFollowed $event): void
    {
        try {
            if ((int) $event->follower->id === (int) $event->followed->id) {
                return;
            }

            $event->followed->notify(new UserFollowedUserNotification($event->follower));
        } catch (\Throwable $e) {
            Log::error('SendUserFollowedDatabaseNotification failed', [
                'follower_id' => $event->follower->id ?? null,
                'followed_id' => $event->followed->id ?? null,
                'error' => $e->getMessage(),
            ]);
            report($e);
        }
    }
}
