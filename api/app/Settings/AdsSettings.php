<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * Global ads kill switch + feed density defaults.
 * Editable from Admin → System Settings → Ads.
 */
class AdsSettings extends Settings
{
    /** 1 = ads on, 0 = kill switch (no injection / no live takes). */
    public int $enabled;

    /** Default insert every N organic items when campaign omits override. */
    public int $slotEveryN;

    /** Skip ads when organic page has fewer than this many items. */
    public int $minOrganicBeforeAd;

    /** Max sponsored items merged into one feed response. */
    public int $maxAdsPerResponse;

    public static function group(): string
    {
        return 'ads';
    }

    public function isEnabled(): bool
    {
        return $this->enabled === 1;
    }
}
