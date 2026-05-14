<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class OverlaySettings extends Settings
{
    /** React overlay origin; must match where the overlay app is served. */
    public ?string $frontendUrl;

    /** Signed overlay link lifetime in seconds (OBS / browser source). */
    public int $defaultTtlSeconds;

    /** Dedicated HMAC secret for signed overlay URLs (required at runtime). */
    public ?string $signingSecret;

    public static function group(): string
    {
        return 'overlay';
    }
}
