<?php

namespace App\Streaming\Support;

/**
 * Parses admin-supplied `streaming_url` values for standalone (URL-only) streams.
 */
final class StreamUrlPlayback
{
    /**
     * Resolve a `streaming_url` into the client playback shape.
     *
     * @return array<string, mixed>
     */
    public static function resolve(string $url): array
    {
        $videoId = self::youtubeVideoId($url);

        if ($videoId) {
            return [
                'mode' => 'iframe',
                'embed_id' => $videoId,
                'embed_url' => YouTubeEmbedUrl::normalize(null, $videoId),
            ];
        }

        if (self::isHlsUrl($url)) {
            return [
                'mode' => 'hls',
                'url' => $url,
            ];
        }

        return [
            'mode' => 'iframe',
            'embed_url' => $url,
        ];
    }

    public static function isHlsUrl(string $url): bool
    {
        $path = parse_url($url, PHP_URL_PATH) ?? '';

        if (str_ends_with(strtolower($path), '.m3u8')) {
            return true;
        }

        $host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');

        return str_contains($host, 'cloudfront.net')
            || str_contains($host, 'live-video.net');
    }

    /**
     * Extract a YouTube video id from a watch / youtu.be / embed URL. Null if not YouTube.
     */
    public static function youtubeVideoId(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $parts = parse_url($url);
        if (! is_array($parts) || empty($parts['host'])) {
            return null;
        }

        $host = strtolower($parts['host']);
        $path = $parts['path'] ?? '';

        if (str_contains($host, 'youtu.be')) {
            return ltrim($path, '/') ?: null;
        }

        if (! str_contains($host, 'youtube.com')) {
            return null;
        }

        if (preg_match('#^/embed/([^/?]+)#', $path, $m)) {
            return $m[1];
        }

        if (! empty($parts['query'])) {
            parse_str($parts['query'], $query);
            if (! empty($query['v'])) {
                return $query['v'];
            }
        }

        return null;
    }
}
