<?php

namespace Tests\Support\Scoring;

/**
 * Stable player IDs used across scoring tests so crease / stats assertions stay readable.
 */
final class PlayerIds
{
    public const STRIKER = 1;

    public const NON_STRIKER = 2;

    public const INCOMING = 3;

    public const FOURTH = 4;

    public const FIFTH = 5;

    public const BOWLER = 10;

    public const BOWLER_2 = 11;

    public const FIELDER = 20;

    /**
     * @return array<int, string>
     */
    public static function names(): array
    {
        return [
            self::STRIKER => 'Striker',
            self::NON_STRIKER => 'NonStriker',
            self::INCOMING => 'Incoming',
            self::FOURTH => 'Fourth',
            self::FIFTH => 'Fifth',
            self::BOWLER => 'Bowler',
            self::BOWLER_2 => 'BowlerTwo',
            self::FIELDER => 'Fielder',
        ];
    }
}
