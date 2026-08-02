<?php

namespace App\Support\Media;

use App\Settings\MediaCdnSettings;
use Throwable;

/**
 * Resolves the public CDN base used for Storage::url() on the s3 disk
 * and for app static assets ({base}/app/...).
 */
final class MediaCdn
{
    /**
     * Effective public CDN base (https://cdn.example.com) or null.
     */
    public static function publicBaseUrl(): ?string
    {
        $fromSettings = null;

        try {
            $fromSettings = app(MediaCdnSettings::class)->cdnPublicBaseUrl;
        } catch (Throwable) {
            // Settings DB may be unavailable during early install / migrate.
        }

        $candidate = is_string($fromSettings) && trim($fromSettings) !== ''
            ? $fromSettings
            : config('filesystems.disks.s3.url');

        return self::normalizeBaseUrl(is_string($candidate) ? $candidate : null);
    }

    /**
     * Apply the effective CDN base to the s3 disk so Storage::url() stays correct.
     */
    public static function applyToFilesystemConfig(): void
    {
        $base = self::publicBaseUrl();
        if ($base === null) {
            return;
        }

        config(['filesystems.disks.s3.url' => $base]);
    }

    public static function normalizeBaseUrl(?string $url): ?string
    {
        if ($url === null) {
            return null;
        }

        $trimmed = rtrim(trim($url), '/');
        if ($trimmed === '') {
            return null;
        }

        if (! preg_match('#^https?://#i', $trimmed)) {
            $trimmed = 'https://'.$trimmed;
        }

        return $trimmed;
    }
}
