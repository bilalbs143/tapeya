<?php

namespace App\Settings;

use Spatie\LaravelSettings\Attributes\ShouldBeEncrypted;
use Spatie\LaravelSettings\Settings;

/**
 * Push notification provider credentials and kill switch.
 * Editable from Admin → System Settings → Push Notifications.
 */
class PushSettings extends Settings
{
    /** 1 = enabled, 0 = kill switch (no FCM delivery). */
    public int $enabled;

    /** Active provider — currently only `fcm`. */
    public string $provider;

    public ?string $fcmProjectId;

    /** Full Firebase service account JSON (stored encrypted). */
    #[ShouldBeEncrypted]
    public ?string $fcmServiceAccountJson;

    public static function group(): string
    {
        return 'push_notifications';
    }
}
