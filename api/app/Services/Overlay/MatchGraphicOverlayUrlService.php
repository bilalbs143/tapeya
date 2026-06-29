<?php

namespace App\Services\Overlay;

use App\Models\MatchGraphicSession;
use App\Settings\OverlaySettings;
use RuntimeException;

/**
 * Issues and persists signed OBS / vMix overlay URLs per graphic session.
 * URLs are reused until an explicit refresh is requested.
 */
final class MatchGraphicOverlayUrlService
{
    public function __construct(
        private readonly OverlaySettings $overlaySettings,
    ) {}

    /**
     * @return array{url: string, expires_at: string, theme_slug: string}
     */
    public function resolve(MatchGraphicSession $session, bool $refresh = false): array
    {
        $session->loadMissing('theme');
        $themeSlug = $session->theme?->slug;
        if ($themeSlug === null || $themeSlug === '') {
            throw new RuntimeException('Graphic session theme is not configured.');
        }

        if (! $refresh && filled($session->signed_overlay_url)) {
            return [
                'url' => (string) $session->signed_overlay_url,
                'expires_at' => $session->signed_overlay_expires_at?->toIso8601String()
                    ?? now()->toIso8601String(),
                'theme_slug' => $themeSlug,
            ];
        }

        $previousExpires = $session->signed_overlay_expires_at?->getTimestamp();
        $payload = $this->buildSignedUrl((int) $session->match_id, $previousExpires);

        $session->forceFill([
            'signed_overlay_url' => $payload['url'],
            'signed_overlay_expires_at' => $payload['expires_at'],
        ])->save();

        return [
            'url' => $payload['url'],
            'expires_at' => $payload['expires_at']->toIso8601String(),
            'theme_slug' => $themeSlug,
        ];
    }

    /**
     * @return array{url: string, expires_at: \Illuminate\Support\Carbon}
     */
    private function buildSignedUrl(int $matchId, ?int $previousExpiresUnix = null): array
    {
        $base = rtrim((string) ($this->overlaySettings->frontendUrl ?? ''), '/');
        if ($base === '') {
            throw new RuntimeException('Overlay frontend URL is not configured.');
        }

        $ttlSeconds = $this->overlaySettings->defaultTtlSeconds;
        if ($ttlSeconds < 1) {
            $ttlSeconds = 86400;
        }

        $expires = time() + $ttlSeconds;
        if ($previousExpiresUnix !== null && $expires <= $previousExpiresUnix) {
            $expires = $previousExpiresUnix + 1;
        }

        $signature = GraphicOverlaySigner::fromSettings($this->overlaySettings)->sign($matchId, $expires);

        $query = http_build_query([
            'expires' => $expires,
            'signature' => $signature,
        ], '', '&', PHP_QUERY_RFC3986);

        return [
            'url' => "{$base}/overlay/{$matchId}?{$query}",
            'expires_at' => now()->setTimestamp($expires),
        ];
    }
}
