<?php

namespace App\Enums\Membership;

use App\Enums\BaseEnumTrait;

enum LevelsEnum: int
{
    use BaseEnumTrait;

    case LEVEL_1 = 1;
    case LEVEL_2 = 2;
    case LEVEL_3 = 3;
    case LEVEL_4 = 4;
    case LEVEL_5 = 5;
    case LEVEL_6 = 6;
    case LEVEL_7 = 7;
    case LEVEL_8 = 8;
    case LEVEL_9 = 9;
    case LEVEL_10 = 10;

    public function label(): int
    {
        return match ($this) {
            self::LEVEL_1 => 1,
            self::LEVEL_2 => 2,
            self::LEVEL_3 => 3,
            self::LEVEL_4 => 4,
            self::LEVEL_5 => 5,
            self::LEVEL_6 => 6,
            self::LEVEL_7 => 7,
            self::LEVEL_8 => 8,
            self::LEVEL_9 => 9,
            self::LEVEL_10 => 10,
        };
    }

    public function namedLabel(): string
    {
        return match ($this) {
            self::LEVEL_1 => __('terms.level_1'),
            self::LEVEL_2 => __('terms.level_2'),
            self::LEVEL_3 => __('terms.level_3'),
            self::LEVEL_4 => __('terms.level_4'),
            self::LEVEL_5 => __('terms.level_5'),
            self::LEVEL_6 => __('terms.level_6'),
            self::LEVEL_7 => __('terms.level_7'),
            self::LEVEL_8 => __('terms.level_8'),
            self::LEVEL_9 => __('terms.level_9'),
            self::LEVEL_10 => __('terms.level_10'),
        };
    }
}
