<?php

namespace App\Enums\Ad;

use App\Enums\BaseEnumTrait;

enum AdSurfaceEnum: string
{
    use BaseEnumTrait;

    case HomeFeed = 'home_feed';
    case ReelsFeed = 'reels_feed';
    case LiveOverlay = 'live_overlay';
    case LiveBreak = 'live_break';

    public function label(): string
    {
        return match ($this) {
            self::HomeFeed => 'Home feed',
            self::ReelsFeed => 'Reels feed',
            self::LiveOverlay => 'Live overlay',
            self::LiveBreak => 'Live break',
        };
    }

    public function isFeedSurface(): bool
    {
        return $this === self::HomeFeed || $this === self::ReelsFeed;
    }
}
