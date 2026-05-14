<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class GeneralSettings extends Settings
{
    /** ISO 4217 currency code (e.g. PKR, USD). */
    public string $currency;

    /** PHP timezone identifier (e.g. Asia/Karachi). */
    public string $timezone;

    public static function group(): string
    {
        return 'general';
    }
}
