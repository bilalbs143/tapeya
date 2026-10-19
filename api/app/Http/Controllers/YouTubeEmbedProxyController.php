<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\View\View;

/**
 * Serves a minimal HTML page that embeds YouTube from a trusted HTTPS origin.
 * Required for Capacitor WebViews (capacitor:// / https://localhost) where a
 * direct youtube.com iframe fails with Error 153 (missing Referer).
 *
 * CSP note: `frame-ancestors *` only covers http(s). Capacitor iOS uses
 * `capacitor://localhost`, so we must list those schemes explicitly or the
 * app WebView blank-screens the iframe.
 */
class YouTubeEmbedProxyController extends Controller
{
    /**
     * Allow embedding from the public site, Capacitor shells, and local web.
     * `*` covers http(s) parents; scheme-sources cover Capacitor custom schemes.
     */
    public const FRAME_ANCESTORS_CSP = 'frame-ancestors * capacitor: ionic: http://localhost https://localhost';

    public function show(Request $request): View|Response
    {
        $rawSrc = trim((string) $request->query('src', ''));
        if ($rawSrc === '' || ! $this->isAllowedYoutubeEmbedUrl($rawSrc)) {
            abort(404);
        }

        $allowControls = $request->query('controls') === '1';

        return response()
            ->view('embed.youtube', [
                'embedSrc' => $rawSrc,
                'allowControls' => $allowControls,
            ])
            ->header('Content-Security-Policy', self::FRAME_ANCESTORS_CSP)
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
