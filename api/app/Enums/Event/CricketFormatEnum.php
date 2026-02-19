<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

enum CricketFormatEnum: string
{
    use BaseEnumTrait;

    case HARD_BALL = 'hard_ball';
    case TAPE_BALL = 'tape_ball';
    case TENNIS_BALL = 'tennis_ball';
    case HARD_TENNIS = 'hard_tennis';
}
