<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\TournamentMatch;
use App\Services\Overlay\GraphicOverlaySigner;
use App\Settings\OverlaySettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Signed public overlay URLs for OBS / vMix browser sources.
 */
class GraphicOverlayUrlController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly OverlaySettings $overlaySettings,
    ) {}

    /**
     * Build a time-limited signed URL for the web app overlay (OBS / vMix browser source).
     */
    public function signedOverlayUrl(Request $request, TournamentMatch $match): JsonResponse
    {
        $ttlSeconds = $this->overlaySettings->defaultTtlSeconds;
        if ($ttlSeconds < 1) {
            $ttlSeconds = 86400;
        }
        $expires = time() + $ttlSeconds;
        $signature = GraphicOverlaySigner::fromSettings($this->overlaySettings)->sign((int) $match->id, $expires);

        $theme = (string) $request->query('theme', 'tapeya-basic');
        $base = rtrim((string) ($this->overlaySettings->frontendUrl ?? ''), '/');
        $query = http_build_query([
            'theme' => $theme,
            'expires' => $expires,
            'signature' => $signature,
        ], '', '&', PHP_QUERY_RFC3986);

        $url = "{$base}/overlay/{$match->id}?{$query}";

        return $this->success([
            'url' => $url,
            'expires_at' => now()->setTimestamp($expires)->toIso8601String(),
        ]);
    }
}
