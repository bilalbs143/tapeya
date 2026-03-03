<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum BattingStyleEnum: string
{
    use BaseEnumTrait;

    case RIGHT_HAND = 'right_hand';
    case LEFT_HAND = 'left_hand';

    public function label(): string
    {
        return match ($this) {
            self::RIGHT_HAND => 'Right Hand',
            self::LEFT_HAND => 'Left Hand',
        };
    }
}
