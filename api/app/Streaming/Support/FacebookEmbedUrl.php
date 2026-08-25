<?php

namespace App\Streaming\Support;

/**
 * Normalize Facebook watch / share / video URLs into plugin iframe embeds.
 *
 * @see https://developers.facebook.com/docs/plugins/embedded-video-player
 */
final class FacebookEmbedUrl
{
    public static function isFacebookHost(string $host): bool
    {
        $host = strtolower($host);
        if (str_starts_with($host, 'www.')) {
            $host = substr($host, 4);
        }

        // Mirror app/src/lib/utils/liveStreamUtils.js isFacebookHost — exact / suffix, not substring.
        return $host === 'facebook.com'
            || $host === 'm.facebook.com'
            || $host === 'fb.watch'
            || $host === 'fb.com'
            || str_ends_with($host, '.facebook.com');
    }

    public static function isFacebookUrl(?string $url): bool
    {
        if (! $url) {
            return false;
        }

        $host = strtolower((string) parse_url($url, PHP_URL_HOST));

        return $host !== '' && self::isFacebookHost($host);
    }

    /**
     * Build a plugins/video.php embed URL, or null if the input is not Facebook.
     */
    public static function embedFromUrl(string $url): ?string
    {
        if (! self::isFacebookUrl($url)) {
            return null;
        }

        $permalink = self::permalink($url);
        if ($permalink === null || $permalink === '') {
            return null;
        }

        return 'https://www.facebook.com/plugins/video.php?'.http_build_query([
            'href' => $permalink,
            'show_text' => 'false',
            'autoplay' => 'true',
            'mute' => '0',
            'width' => '1280',
            'height' => '720',
            'allowfullscreen' => 'true',
        ], '', '&', PHP_QUERY_RFC3986);
    }

    /**
     * Canonical Facebook video URL suitable for the plugin `href` param.
     */
    public static function permalink(string $url): ?string
    {
        $parts = parse_url($url);
        if (! is_array($parts) || empty($parts['host'])) {
            return null;
        }

        $host = strtolower($parts['host']);
        if (! self::isFacebookHost($host)) {
            return null;
        }

        $path = $parts['path'] ?? '/';
        $query = [];
        if (! empty($parts['query'])) {
            parse_str($parts['query'], $query);
        }

        // watch/?v=… , watch/live/?v=… , and video.php?v=…
        if (! empty($query['v']) && preg_match('/^\d+$/', (string) $query['v'])) {
            return 'https://www.facebook.com/watch/?v='.$query['v'];
        }

        // /share/v/{code} — opaque short links; plugin accepts the share URL as href.
        if (preg_match('#^/share/v/([^/]+)/?$#', $path, $m)) {
            return 'https://www.facebook.com/share/v/'.$m[1];
        }

        // /{page}/videos/{id}/ — keep canonical page video URL (watch/?v= often fails for page posts).
        if (preg_match('#/videos/(\d+)#', $path, $m)) {
            $cleanPath = rtrim($path, '/');

            return 'https://www.facebook.com'.$cleanPath;
        }

        // /reel/{id}
        if (preg_match('#^/reel/(\d+)#', $path, $m)) {
            return 'https://www.facebook.com/reel/'.$m[1];
        }

        // fb.watch/{code}
        if (str_contains($host, 'fb.watch')) {
            $code = trim($path, '/');

            return $code !== '' ? 'https://fb.watch/'.$code : null;
        }

        // Fallback: strip tracking query, keep path on facebook.com
        $cleanPath = $path === '' ? '/' : $path;

        return 'https://www.facebook.com'.$cleanPath;
    }
}
