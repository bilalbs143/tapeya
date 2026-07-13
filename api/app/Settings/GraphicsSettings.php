<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class GraphicsSettings extends Settings
{
    /** graphics.tapeya.com origin; must match where the graphics app is served. */
    public ?string $frontendUrl;

    /** Signed graphics link lifetime in seconds (OBS / browser source). */
    public int $defaultTtlSeconds;

    /** Dedicated HMAC secret for signed graphics URLs (required at runtime). */
    public ?string $signingSecret;

    public static function group(): string
    {
        return 'graphics';
    }
}
