<?php

namespace App\Enums\GameResultCard;

use App\Enums\BaseEnumTrait;

enum GameResultCardTypeEnum: string
{
    use BaseEnumTrait;

    case URL = 'url';
}
