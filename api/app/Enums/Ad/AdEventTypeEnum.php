<?php

namespace App\Enums\Ad;

use App\Enums\BaseEnumTrait;

enum AdEventTypeEnum: string
{
    use BaseEnumTrait;

    case Impression = 'impression';
    case View = 'view';
    case Click = 'click';
    case Report = 'report';
    case Skip = 'skip';
    case Complete = 'complete';
    case Dismiss = 'dismiss';

    public function label(): string
    {
        return match ($this) {
            self::Impression => 'Impression',
            self::View => 'View',
            self::Click => 'Click',
            self::Report => 'Report',
            self::Skip => 'Skip',
            self::Complete => 'Complete',
            self::Dismiss => 'Dismiss',
        };
    }
}
