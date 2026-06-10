<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

enum NoBallTypeEnum: string
{
    use BaseEnumTrait;

    case OVER_FOOTED = 'over_footed';
    case OVER_HEIGHTEN = 'over_heighten';
    case FIELD_RESTRICTION = 'field_restriction';
    case BOWLING_ACTION = 'bowling_action';

    public function label(): string
    {
        return match ($this) {
            self::OVER_FOOTED => 'Front Foot No-Ball',
            self::OVER_HEIGHTEN => 'High Full Toss',
            self::FIELD_RESTRICTION => 'Field Restriction',
            self::BOWLING_ACTION => 'Bowling Action',
        };
    }
}
