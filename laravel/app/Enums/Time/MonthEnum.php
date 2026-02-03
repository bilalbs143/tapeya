<?php

namespace App\Enums\Time;

use App\Enums\BaseEnumTrait;

enum MonthEnum: int
{
    use BaseEnumTrait;

    case JANUARY = 1;
    case FEBRUARY = 2;
    case MARCH = 3;
    case APRIL = 4;
    case MAY = 5;
    case JUNE = 6;
    case JULY = 7;
    case AUGUST = 8;
    case SEPTEMBER = 9;
    case OCTOBER = 10;
    case NOVEMBER = 11;
    case DECEMBER = 12;

    public function label()
    {
        return match ($this) {
            self::JANUARY => __('terms.january'),
            self::FEBRUARY => __('terms.february'),
            self::MARCH => __('terms.march'),
            self::APRIL => __('terms.april'),
            self::MAY => __('terms.may'),
            self::JUNE => __('terms.june'),
            self::JULY => __('terms.july'),
            self::AUGUST => __('terms.august'),
            self::SEPTEMBER => __('terms.september'),
            self::OCTOBER => __('terms.october'),
            self::NOVEMBER => __('terms.november'),
            self::DECEMBER => __('terms.december'),
        };
    }
}
