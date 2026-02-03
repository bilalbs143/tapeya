<?php

namespace App\Enums;

trait BaseEnumTrait
{
    public static function withLabels(): array
    {
        $valuesWithLabels = [];

        foreach (self::cases() as $case) {
            $valuesWithLabels[$case->value] = $case->label();
        }

        return $valuesWithLabels;
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label()
    {
        return __("terms.{$this->value}");
    }
}
