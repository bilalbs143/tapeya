<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * Operational tunables for live match chat (rate limits, kill switch).
 * Editable from Admin → System Settings → Live Match Chat.
 */
class LiveChatSettings extends Settings
{
    /** 1 = enabled, 0 = kill switch (all POSTs return 403). */
    public int $enabled;

    /** Minimum seconds between sends per user per match. */
    public int $minIntervalSec;

    /** Max messages per user per burstWindowSec. */
    public int $burstMax;

    /** Duration of the burst window in seconds. */
    public int $burstWindowSec;

    /** Max comment body length in characters. */
    public int $bodyMax;

    public static function group(): string
    {
        return 'live_chat';
    }
}
