<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Models\User;
use App\Notifications\OrderPlacedAdminNotification;
use App\Notifications\OrderPlacedUserNotification;
use App\Utils\Services\SystemUserService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;

class SendOrderPlacedNotifications implements ShouldQueue
{
    /**
     * Handle the event:
     * - User (customer): email + SMS.
     * - Admin users (type=administrator): email + database.
     * - Config admin_emails (optional): email only.
     */
    public function handle(OrderPlaced $event): void
    {
        $order = $event->order;
        $order->loadMissing(['user', 'items']);

        // Customer: mail + SMS (SMS only if user has phone)
        $user = $order->user;
        if ($user) {
            $user->notify(new OrderPlacedUserNotification($order));
        }

        // Shared admin inbox: one notification per order on System user; read_by stores which admin marked it read.
        $systemUser = SystemUserService::get();
        if ($systemUser) {
            $systemUser->notify(new OrderPlacedAdminNotification($order));
        }

        // Optional: mail to config admin_emails (mail only).
        $configAdminEmails = config('notifications.admin_emails', []);
        if (is_array($configAdminEmails)) {
            foreach ($configAdminEmails as $email) {
                if (is_string($email) && $email !== '') {
                    Notification::route('mail', $email)->notify(new OrderPlacedAdminNotification($order));
                }
            }
        }
    }
}
