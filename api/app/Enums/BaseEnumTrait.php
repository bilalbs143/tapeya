<?php

namespace App\Enums;

use Illuminate\Support\Str;

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

    public function label(): string
    {
        return Str::headline($this->value);
    }
}
