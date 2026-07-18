<?php

namespace App\Enums\Streaming;

use App\Enums\BaseEnumTrait;

/**
 * Self-serve Go Live encode / viewer aspect.
 *
 * @see docs/LIVE_STREAM_ORIENTATION.md
 */
enum StreamOrientationEnum: string
{
    use BaseEnumTrait;

    case Portrait = 'portrait';
    case Landscape = 'landscape';

    public function label(): string
    {
        return match ($this) {
            self::Portrait => 'Portrait · 9:16',
            self::Landscape => 'Landscape · 16:9',
        };
    }

    /** Short coaching copy for the Go Live form picker. */
    public function hint(): string
    {
        return match ($this) {
            self::Portrait => 'hold your phone upright',
            self::Landscape => 'hold your phone sideways',
        };
    }

    public function isLandscape(): bool
    {
        return $this === self::Landscape;
    }

    public function isPortrait(): bool
    {
        return $this === self::Portrait;
    }

    /**
     * Coerce API / metadata / legacy values to a known orientation.
     */
    public static function normalize(mixed $value): self
    {
        if ($value instanceof self) {
            return $value;
        }

        if (is_string($value)) {
            return self::tryFrom($value) ?? self::Portrait;
        }

        return self::Portrait;
    }
}
