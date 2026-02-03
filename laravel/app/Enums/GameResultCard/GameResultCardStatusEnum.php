<?php

namespace App\Enums\GameResultCard;

use App\Enums\BaseEnumTrait;

enum GameResultCardStatusEnum: string
{
    use BaseEnumTrait;

    case PENDING = 'pending';
    case RESOLVED = 'resolved';
}
