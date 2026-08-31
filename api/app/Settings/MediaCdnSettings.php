<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * Public media / static-asset CDN hostname (Cloudflare in front of B2).
 * Credentials stay in .env; only the public HTTPS base is editable here.
 */
class MediaCdnSettings extends Settings
{
    /**
     * Public CDN origin with no trailing slash (e.g. https://cdn.tapeya.com).
     * Empty → https://cdn.tapeya.com.
     */
    public ?string $cdnPublicBaseUrl;

    public static function group(): string
    {
        return 'media_cdn';
    }
}
