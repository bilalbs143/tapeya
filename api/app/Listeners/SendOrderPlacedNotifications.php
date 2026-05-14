<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Notifications\OrderPlacedAdminNotification;
use App\Notifications\OrderPlacedUserMailSmsNotification;
use App\Settings\AdminNotificationSettings;
use App\Utils\Services\SystemUserService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;

class SendOrderPlacedNotifications implements ShouldQueue
{
    public function __construct(private readonly AdminNotificationSettings $adminNotificationSettings) {}

    /**
     * Handle the event (queued):
     * - User (customer): queued mail + SMS (database already written by SendOrderPlacedCustomerDatabaseNotification).
     * - Shared admin inbox + optional config emails.
     */
    public function handle(OrderPlaced $event): void
    {
        $order = $event->order;
        $order->loadMissing(['user', 'items']);

        $user = $order->user;
        if ($user) {
            $user->notify(new OrderPlacedUserMailSmsNotification($order));
        }

        // Shared admin inbox: one notification per order on System user; read_by stores which admin marked it read.
        $systemUser = SystemUserService::get();
        if ($systemUser) {
            $systemUser->notify(new OrderPlacedAdminNotification($order));
        }

        // Optional: mail to admin_emails system setting (mail only).
        $configAdminEmails = $this->adminNotificationSettings->adminEmails;
        if (is_array($configAdminEmails)) {
            foreach ($configAdminEmails as $email) {
                if (is_string($email) && $email !== '') {
                    Notification::route('mail', $email)->notify(new OrderPlacedAdminNotification($order));
                }
            }
        }
    }
}
