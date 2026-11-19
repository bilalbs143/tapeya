<?php

namespace App\Enums\Ad;

use App\Enums\BaseEnumTrait;

enum LiveAdTakeModeEnum: string
{
    use BaseEnumTrait;

    case Overlay = 'overlay';
    case Break = 'break';

    public function label(): string
    {
        return match ($this) {
            self::Overlay => 'Overlay',
            self::Break => 'Break',
        };
    }

    public function toSurface(): AdSurfaceEnum
    {
        return match ($this) {
            self::Overlay => AdSurfaceEnum::LiveOverlay,
            self::Break => AdSurfaceEnum::LiveBreak,
        };
    }
}
