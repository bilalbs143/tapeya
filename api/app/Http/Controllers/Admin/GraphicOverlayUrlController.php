<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Concerns\ResolvesMatchGraphicSession;
use App\Http\Controllers\Controller;
use App\Models\TournamentMatch;
use App\Services\Overlay\GraphicOverlaySigner;
use App\Settings\OverlaySettings;
use Illuminate\Http\JsonResponse;

/**
 * Signed public overlay URLs for OBS / vMix browser sources.
 */
class GraphicOverlayUrlController extends Controller
{
    use BaseControllerTrait;
    use ResolvesMatchGraphicSession;

    public function __construct(
        private readonly OverlaySettings $overlaySettings,
    ) {}

    /**
     * Build a time-limited signed URL for the web app overlay (OBS / vMix browser source).
     * Theme slug is derived from the configured graphic session.
     */
    public function signedOverlayUrl(TournamentMatch $match): JsonResponse
    {
        $session = $this->requireMatchGraphicSession($match);
        if ($session instanceof JsonResponse) {
            return $session;
        }

        $session->loadMissing('theme');
        $themeSlug = $session->theme?->slug;
        if ($themeSlug === null || $themeSlug === '') {
            return $this->failure('Graphic session theme is not configured.', 'VALIDATION_ERROR');
        }

        $ttlSeconds = $this->overlaySettings->defaultTtlSeconds;
        if ($ttlSeconds < 1) {
            $ttlSeconds = 86400;
        }
        $expires = time() + $ttlSeconds;
        $signature = GraphicOverlaySigner::fromSettings($this->overlaySettings)->sign((int) $match->id, $expires);

        $base = rtrim((string) ($this->overlaySettings->frontendUrl ?? ''), '/');
        $query = http_build_query([
            'expires' => $expires,
            'signature' => $signature,
        ], '', '&', PHP_QUERY_RFC3986);

        $url = "{$base}/overlay/{$match->id}?{$query}";

        return $this->success([
            'url' => $url,
            'expires_at' => now()->setTimestamp($expires)->toIso8601String(),
            'theme_slug' => $themeSlug,
        ]);
    }
}
