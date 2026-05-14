<?php

namespace App\Services\Overlay;

use App\Settings\OverlaySettings;

final class MatchGraphicOverlaySigner
{
    public function __construct(private readonly string $secret) {}

    /**
     * Build a signer from the overlay system settings (signing secret is required).
     */
    public static function fromSettings(OverlaySettings $settings): self
    {
        $secret = trim((string) ($settings->signingSecret ?? ''));

        return new self($secret);
    }

    public function sign(int $matchId, int $expiresUnix): string
    {
        return hash_hmac('sha256', $matchId.'|'.$expiresUnix, $this->secret);
    }

    /**
     * @param  string  $signature  Hex HMAC from sign()
     */
    public function verify(int $matchId, int $expiresUnix, string $signature): bool
    {
        if ($signature === '') {
            return false;
        }

        // Small clock-skew tolerance on the client / server boundary.
        if ($expiresUnix < time() - 120) {
            return false;
        }

        return hash_equals($this->sign($matchId, $expiresUnix), $signature);
    }
}
