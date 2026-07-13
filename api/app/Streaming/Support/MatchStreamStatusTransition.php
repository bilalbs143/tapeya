<?php

namespace App\Streaming\Support;

use App\Models\MatchStream;
use App\Settings\StreamingSettings;
use Carbon\Carbon;

/**
 * Maps provider-reported signals (live / starting / idle) onto persisted stream
 * status, with a grace period before auto-ending idle sessions.
 */
final class MatchStreamStatusTransition
{
    /** Don't downgrade owner-confirmed self-serve publish while YouTube ingest catches up. */
    public const OWNER_PUBLISHING_GRACE_MINUTES = 5;

    public static function idleEndGraceMinutes(): int
    {
        $minutes = app(StreamingSettings::class)->idleEndGraceMinutes;

        return max(1, (int) $minutes);
    }

    /**
     * @return array<string, mixed>|null Column updates, or null when unchanged.
     */
    public static function resolve(MatchStream $stream, string $providerStatus): ?array
    {
        $providerStatus = match ($providerStatus) {
            'live', 'starting', 'idle' => $providerStatus,
            default => 'idle',
        };

        $metadata = $stream->provider_metadata ?? [];

        if ($providerStatus === 'live') {
            unset($metadata['idle_since'], $metadata['owner_publishing_since']);

            $updates = [
                'status' => 'live',
                'provider_metadata' => $metadata,
            ];

            if (! $stream->started_at) {
                $updates['started_at'] = now();
            }

            return self::hasChanges($stream, $updates) ? $updates : null;
        }

        if ($providerStatus === 'starting') {
            unset($metadata['idle_since']);

            if ($stream->status === 'live' && self::ownerPublishingGraceActive($stream, $metadata)) {
                return null;
            }

            $updates = [
                'status' => 'starting',
                'provider_metadata' => $metadata,
            ];

            return self::hasChanges($stream, $updates) ? $updates : null;
        }

        return self::resolveIdle($stream, $metadata);
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    private static function ownerPublishingGraceActive(MatchStream $stream, array $metadata): bool
    {
        if ($stream->owner_user_id === null) {
            return false;
        }

        $since = $metadata['owner_publishing_since'] ?? null;

        if (! $since) {
            return false;
        }

        return Carbon::parse($since)->diffInMinutes(now()) < self::OWNER_PUBLISHING_GRACE_MINUTES;
    }

    /**
     * @param  array<string, mixed>  $metadata
     * @return array<string, mixed>|null
     */
    private static function resolveIdle(MatchStream $stream, array $metadata): ?array
    {
        if (self::ownerPublishingGraceActive($stream, $metadata) && in_array($stream->status, ['live', 'starting'], true)) {
            return null;
        }
        if (! isset($metadata['idle_since']) && in_array($stream->status, ['live', 'starting'], true)) {
            $metadata['idle_since'] = now()->toIso8601String();
        }

        if (isset($metadata['idle_since']) && self::idleGraceElapsed($metadata['idle_since'])) {
            $updates = [
                'status' => 'ended',
                'ended_at' => $stream->ended_at ?? now(),
                'provider_metadata' => $metadata,
            ];

            return self::hasChanges($stream, $updates) ? $updates : null;
        }

        if ($stream->status === 'idle' && isset($metadata['idle_since'])) {
            return null;
        }

        $updates = [
            'status' => 'idle',
            'provider_metadata' => $metadata,
        ];

        return self::hasChanges($stream, $updates) ? $updates : null;
    }

    private static function idleGraceElapsed(string $idleSince): bool
    {
        return Carbon::parse($idleSince)->diffInMinutes(now()) >= self::idleEndGraceMinutes();
    }

    /**
     * @param  array<string, mixed>  $updates
     */
    private static function hasChanges(MatchStream $stream, array $updates): bool
    {
        foreach ($updates as $key => $value) {
            if ($key === 'provider_metadata') {
                if (($stream->provider_metadata ?? []) != $value) {
                    return true;
                }

                continue;
            }

            if ($stream->getAttribute($key) != $value) {
                return true;
            }
        }

        return false;
    }
}
