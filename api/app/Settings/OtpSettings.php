<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class OtpSettings extends Settings
{
    /**
     * E.164 phone numbers that receive OTP in JSON only (no real SMS) — QA use.
     *
     * @var list<string>
     */
    public array $testPhoneNumbers;

    public static function group(): string
    {
        return 'otp';
    }
}
