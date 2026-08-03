<?php

namespace App\Listeners;

use App\Events\UserReferred;
use App\Notifications\UserReferredUserNotification;
use Illuminate\Support\Facades\Log;

/**
 * Sync DB notification so Reverb can broadcast the badge update immediately.
 */
class SendUserReferredDatabaseNotification
{
    public function handle(UserReferred $event): void
    {
        try {
            if ((int) $event->referrer->id === (int) $event->referred->id) {
                return;
            }

            $event->referrer->notify(new UserReferredUserNotification($event->referred));
        } catch (\Throwable $e) {
            Log::error('SendUserReferredDatabaseNotification failed', [
                'referrer_id' => $event->referrer->id ?? null,
                'referred_id' => $event->referred->id ?? null,
                'error' => $e->getMessage(),
            ]);
            report($e);
        }
    }
}
