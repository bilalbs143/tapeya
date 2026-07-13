<?php

namespace App\Services\Graphics;

use App\Models\MatchGraphicSession;
use App\Settings\GraphicsSettings;
use Illuminate\Support\Carbon;
use RuntimeException;

/**
 * Issues signed OBS / vMix graphics URLs per graphic session.
 *
 * Each resolve() rotates the active link: a new expires + signature is persisted and
 * {@see isCurrentLink()} rejects any previously issued URL for that session.
 */
final class MatchGraphicSignedUrlService
{
    public function __construct(
        private readonly GraphicsSettings $graphicsSettings,
    ) {}

    /**
     * Issue a new signed URL and persist it on the session (invalidates any previous link).
     *
     * @return array{url: string, expires_at: string, theme_slug: string}
     */
    public function resolve(MatchGraphicSession $session): array
    {
        $session->loadMissing('theme');
        $themeSlug = $session->theme?->slug;
        if ($themeSlug === null || $themeSlug === '') {
            throw new RuntimeException('Graphic session theme is not configured.');
        }

        $previousExpires = $session->signed_overlay_expires_at?->getTimestamp();
        $payload = $this->buildSignedUrl((int) $session->id, $previousExpires);

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

    /** Whether this expires value is still the active link for the session. */
    public function isCurrentLink(MatchGraphicSession $session, int $expires): bool
    {
        if ($session->signed_overlay_expires_at === null) {
            return true;
        }

        return $expires === $session->signed_overlay_expires_at->getTimestamp();
    }

    /**
     * @return array{url: string, expires_at: Carbon}
     */
    private function buildSignedUrl(int $sessionId, ?int $previousExpiresUnix = null): array
    {
        $base = rtrim((string) ($this->graphicsSettings->frontendUrl ?? ''), '/');
        if ($base === '') {
            throw new RuntimeException('Graphics frontend URL is not configured.');
        }

        $ttlSeconds = $this->graphicsSettings->defaultTtlSeconds;
        if ($ttlSeconds < 1) {
            $ttlSeconds = 86400;
        }

        $expires = time() + $ttlSeconds;
        if ($previousExpiresUnix !== null) {
            $expires = max($expires, $previousExpiresUnix + 1);
        }

        $token = GraphicAccessSigner::fromSettings($this->graphicsSettings)
            ->buildToken($sessionId, $expires);

        return [
            'url' => "{$base}/{$token}",
            'expires_at' => now()->setTimestamp($expires),
        ];
    }
}
