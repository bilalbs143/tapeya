<?php

namespace App\Http\Controllers;

use App\Streaming\Support\YouTubeEmbedUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\View\View;

/**
 * Serves a minimal HTML page that embeds YouTube from a trusted HTTPS origin.
 * Required for iOS Capacitor (capacitor://) where direct YouTube iframes fail with Error 153.
 */
class YouTubeEmbedProxyController extends Controller
{
    public function show(Request $request): View|Response
    {
        $rawSrc = trim((string) $request->query('src', ''));
        if ($rawSrc === '' || ! $this->isAllowedYoutubeEmbedUrl($rawSrc)) {
            abort(404);
        }

        return response()
            ->view('embed.youtube', [
                'embedSrc' => $rawSrc,
                'youtubeEmbedOrigin' => YouTubeEmbedUrl::trustedAppOrigin(),
            ])
            ->header('Content-Security-Policy', 'frame-ancestors *')
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    private function isAllowedYoutubeEmbedUrl(string $url): bool
    {
        $parts = parse_url($url);
        if (! is_array($parts)) {
            return false;
        }

        $host = strtolower((string) ($parts['host'] ?? ''));
        if (! in_array($host, ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com'], true)) {
            return false;
        }

        return isset($parts['path']) && preg_match('#/embed/[^/]+#', $parts['path']) === 1;
    }
}
