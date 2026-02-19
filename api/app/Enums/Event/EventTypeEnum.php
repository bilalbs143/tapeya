<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

enum EventTypeEnum: string
{
    use BaseEnumTrait;

    case LEAGUE = 'league';
    case TOURNAMENT = 'tournament';
    case FRIENDLY_MATCHES = 'friendly_matches';
}
