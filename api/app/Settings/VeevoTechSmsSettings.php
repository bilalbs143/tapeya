<?php

namespace App\Settings;

use Spatie\LaravelSettings\Attributes\ShouldBeEncrypted;
use Spatie\LaravelSettings\Settings;

/**
 * VeevoTech gateway fields only. SMS driver and OTP template live in {@see SmsSettings}.
 */
class VeevoTechSmsSettings extends Settings
{
    /** VeevoTech sender label (`sendernum`). */
    public ?string $from;

    /** VeevoTech sendsms endpoint URL (required when SMS driver is veevotech). */
    public ?string $veevotechApiUrl;

    /** VeevoTech API hash (request field `hash`). Stored encrypted. */
    #[ShouldBeEncrypted]
    public ?string $veevotechApiKey;

    public static function group(): string
    {
        return 'sms_veevotech';
    }
}
