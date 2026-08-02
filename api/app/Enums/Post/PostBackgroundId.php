<?php

namespace App\Enums\Post;

use App\Enums\BaseEnumTrait;

/**
 * Persisted short-text post backgrounds (posts.background_id).
 * "plain" is accepted on input but stored as null.
 */
enum PostBackgroundId: string
{
    use BaseEnumTrait;

    case Pitch = 'pitch';
    case Night = 'night';
    case Gold = 'gold';
    case Boundary = 'boundary';
    case Bats = 'bats';
    case Balls = 'balls';
    case Wickets = 'wickets';
    case Century = 'century';

    public function label(): string
    {
        return match ($this) {
            self::Pitch => 'Turf',
            self::Night => 'Floodlit',
            self::Gold => 'Brand Gold',
            self::Boundary => 'Victory Ribbon',
            self::Bats => 'Stadium Lights',
            self::Balls => 'Tapeball',
            self::Wickets => 'Champions',
            self::Century => 'Century',
        };
    }

    /**
     * Values allowed on compose request (includes plain → stored null).
     *
     * @return list<string>
     */
    public static function inputValues(): array
    {
        return ['plain', ...self::values()];
    }

    /**
     * Normalize client input to a DB value (null = plain / unset / unknown).
     */
    public static function normalize(mixed $raw): ?string
    {
        if (! is_string($raw) || $raw === '' || $raw === 'plain') {
            return null;
        }

        return self::tryFrom($raw)?->value;
    }
}
