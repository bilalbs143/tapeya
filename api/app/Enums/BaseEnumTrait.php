<?php

namespace App\Enums;

trait BaseEnumTrait
{
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function labels(): array
    {
        $out = [];
        foreach (self::cases() as $case) {
            $out[$case->value] = $case->label();
        }

        return $out;
    }

    /**
     * Map a stored backing value (e.g. from the database) to a display label, or null if empty / not a known case.
     */
    public static function tryLabelFromValue(string|int|null $raw): ?string
    {
        if ($raw === null || $raw === '') {
            return null;
        }

        return self::tryFrom($raw)?->label();
    }
}
