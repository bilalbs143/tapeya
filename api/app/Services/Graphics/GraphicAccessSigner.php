<?php

namespace App\Services\Graphics;

use App\Settings\GraphicsSettings;

final class GraphicAccessSigner
{
    /** @var non-empty-string */
    private const TOKEN_PATTERN = '/^(\d+)-(\d+)-([a-f0-9]{64})$/';

    public function __construct(private readonly string $secret) {}

    /**
     * Build a signer from the graphics system settings (signing secret is required).
     */
    public static function fromSettings(GraphicsSettings $settings): self
    {
        $secret = trim((string) ($settings->signingSecret ?? ''));

        if ($secret === '') {
            throw new \RuntimeException('GraphicsSettings::signingSecret is not configured.');
        }

        return new self($secret);
    }

    public function sign(int $subjectId, int $expiresUnix): string
    {
        return hash_hmac('sha256', $subjectId.'|'.$expiresUnix, $this->secret);
    }

    /**
     * Stateless graphics access token: {sessionId}-{expiresUnix}-{signatureHex}
     */
    public function buildToken(int $subjectId, int $expiresUnix): string
    {
        return sprintf(
            '%d-%d-%s',
            $subjectId,
            $expiresUnix,
            $this->sign($subjectId, $expiresUnix),
        );
    }

    /**
     * @return array{sessionId: int, expires: int, signature: string}|null
     */
    public function parseToken(string $token): ?array
    {
        $token = trim($token);
        if ($token === '' || ! preg_match(self::TOKEN_PATTERN, $token, $matches)) {
            return null;
        }

        return [
            'sessionId' => (int) $matches[1],
            'expires' => (int) $matches[2],
            'signature' => $matches[3],
        ];
    }

    /**
     * @return array{sessionId: int, expires: int, signature: string}|null
     */
    public function verifyToken(string $token): ?array
    {
        $parsed = $this->parseToken($token);
        if ($parsed === null) {
            return null;
        }

        if (! $this->verify($parsed['sessionId'], $parsed['expires'], $parsed['signature'])) {
            return null;
        }

        return $parsed;
    }

    /**
     * @param  string  $signature  Hex HMAC from sign()
     */
    public function verify(int $subjectId, int $expiresUnix, string $signature): bool
    {
        if ($signature === '') {
            return false;
        }

        // Small clock-skew tolerance on the client / server boundary.
        if ($expiresUnix < time() - 120) {
            return false;
        }

        return hash_equals($this->sign($subjectId, $expiresUnix), $signature);
    }
}
