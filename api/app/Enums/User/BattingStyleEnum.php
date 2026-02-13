<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum BattingStyleEnum: string
{
    use BaseEnumTrait;

    case RIGHT_HAND = 'right_hand';
    case LEFT_HAND = 'left_hand';
}
