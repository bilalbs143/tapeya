<?php

namespace App\Support\Broadcast;

/**
 * Slim Reverb/Pusher payloads for graphic channels.
 *
 * Full {@see GraphicContextBuilder} output can exceed the ~10 KB broker limit.
 * WebSocket events carry metadata + {@see GraphicContextHash::hash()} only;
 * overlays refetch context over HTTP when the hash changes.
 */
final class GraphicBroadcastEnvelope
{
    /** Pusher-compatible soft limit (bytes) for guard assertions in tests. */
    public const int MAX_PAYLOAD_BYTES = 10_240;

    /**
     * @param  array<string, mixed>  $payload
     */
    public static function assertWithinLimit(array $payload, string $label = 'graphic broadcast'): void
    {
        $bytes = strlen(json_encode($payload, JSON_THROW_ON_ERROR));

        if ($bytes > self::MAX_PAYLOAD_BYTES) {
            throw new \RuntimeException("{$label} payload is {$bytes} bytes (max ".self::MAX_PAYLOAD_BYTES.')');
        }
    }
}
