<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum PlayingRoleEnum: string
{
    use BaseEnumTrait;

    case BOWLER = 'bowler';
    case BATSMAN = 'batsman';
    case ALL_ROUNDER = 'all_rounder';
}
