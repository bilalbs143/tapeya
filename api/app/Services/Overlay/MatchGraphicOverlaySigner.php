<?php

namespace App\Services\Overlay;

final class MatchGraphicOverlaySigner
{
    public function __construct(private readonly string $secret) {}

    public static function fromConfig(): self
    {
        $secret = config('overlay.signing_secret') ?: config('app.key');

        return new self((string) $secret);
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

        // Small clock skew tolerance on the client / server boundary.
        if ($expiresUnix < time() - 120) {
            return false;
        }

        $expected = $this->sign($matchId, $expiresUnix);

        return hash_equals($expected, $signature);
    }
}
