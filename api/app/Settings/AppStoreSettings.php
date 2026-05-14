<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class AppStoreSettings extends Settings
{
    /** Apple App Store listing URL. */
    public ?string $iosStoreUrl;

    /** Google Play listing URL. */
    public ?string $androidStoreUrl;

    /** CFBundleShortVersionString-style version shown on the App Store listing. */
    public ?string $iosVersion;

    /** Version name of the live build on Google Play. */
    public ?string $androidVersion;

    public static function group(): string
    {
        return 'app_store';
    }
}
