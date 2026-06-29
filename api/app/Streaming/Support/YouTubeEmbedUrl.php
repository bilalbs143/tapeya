<?php

namespace App\Streaming\Support;

use App\Settings\ContactSettings;

/**
 * YouTube iframe embed URLs tuned for in-app playback (custom chrome, no YT fullscreen).
 */
final class YouTubeEmbedUrl
{
    /**
     * Trusted app origin for YouTube `origin` (Admin → System Settings → Public Website URL).
     */
    public static function trustedAppOrigin(): ?string
    {
        $url = trim((string) app(ContactSettings::class)->publicWebsiteUrl);
        if ($url === '') {
            return null;
        }

        return rtrim($url, '/');
    }

    /**
     * @return array<string, string|int>
     */
    public static function defaultParams(): array
    {
        return [
            'autoplay' => '1',
            'rel' => '0',
            'modestbranding' => '1',
            'controls' => '0',
            'fs' => '0',
            'disablekb' => '1',
            'playsinline' => '1',
            'iv_load_policy' => '3',
            'cc_load_policy' => '0',
        ];
    }

    public static function build(string $videoId): string
    {
        $id = trim($videoId);

        return 'https://www.youtube.com/embed/'.$id.'?'.http_build_query(self::defaultParams());
    }

    public static function normalize(?string $embedUrl, ?string $fallbackId = null): ?string
    {
        if (! $embedUrl && $fallbackId) {
            return self::build($fallbackId);
        }

        if (! $embedUrl) {
            return null;
        }

        $parts = parse_url($embedUrl);
        if (! is_array($parts)) {
            return $fallbackId ? self::build($fallbackId) : $embedUrl;
        }

        $id = self::extractId($parts, $fallbackId);
        if (! $id) {
            return $embedUrl;
        }

        $query = [];
        if (! empty($parts['query'])) {
            parse_str($parts['query'], $query);
        }

        // App defaults must always win — stored URL may have stale or conflicting params.
        $merged = array_merge($query, self::defaultParams());

        return 'https://www.youtube.com/embed/'.$id.'?'.http_build_query($merged);
    }

    /**
     * @param  array<string, mixed>  $parts
     */
    private static function extractId(array $parts, ?string $fallbackId): ?string
    {
        if (! empty($parts['path']) && preg_match('#/embed/([^/?]+)#', $parts['path'], $m)) {
            return $m[1];
        }

        return $fallbackId;
    }
}
