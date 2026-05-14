<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * SMS channel selection and OTP copy. VeevoTech URL/hash/sender live in {@see VeevoTechSmsSettings}.
 */
class SmsSettings extends Settings
{
    /** SMS driver name: log | null | veevotech | whatsapp. */
    public ?string $driver;

    /** OTP SMS body; must contain the :code placeholder. */
    public ?string $otpMessage;

    public static function group(): string
    {
        return 'sms';
    }
}
