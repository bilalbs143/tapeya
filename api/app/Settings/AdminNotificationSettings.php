<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class AdminNotificationSettings extends Settings
{
    /**
     * Admin inboxes for order / system mail.
     *
     * @var list<string>
     */
    public array $adminEmails;

    public static function group(): string
    {
        return 'admin_notification';
    }
}
