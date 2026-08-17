<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * Operational tunables for posts/reels (upload limits, HLS segments, views, multipart).
 * Editable from Admin → System Settings → Reels.
 * HLS delivery is always on; ladder / FFmpeg binaries stay in config/posts.php.
 */
class PostsSettings extends Settings
{
    /** Max reel duration in seconds (0 = no app limit). */
    public int $maxDurationSeconds;

    /** Min reel duration in seconds (0 = no app limit). */
    public int $minDurationSeconds;

    /** Max original upload size in MB (0 = no app limit). */
    public int $maxUploadMb;

    /** HLS segment length in seconds (clamped 2–4; default 2 for faster ABR on short reels). */
    public int $hlsSegmentSeconds;

    /** Minimum watched ms to count a view. */
    public int $viewMinWatchedMs;

    /** Min completion percent (0–100) to count a view; 25 = 25%. */
    public int $viewMinCompletionRatePercent;

    /** 1 = allow anonymous view counting, 0 = auth required. */
    public int $viewAllowAnonymous;

    /** @deprecated Counts write straight to MySQL; kept for admin UI / legacy Redis drain. */
    public int $viewRedisBuffer;

    /** Multipart chunk size in MB (e.g. 1 = 1 MB parts). */
    public int $multipartPartSizeMb;

    /** Max multipart parts (0 = no app limit). */
    public int $multipartMaxParts;

    /** 1 = auto like/view boost from random active users, 0 = off. */
    public int $autoEngagementEnabled;

    /**
     * Target likes_count and views_count per reel (video post).
     * Likes on reels also record a view for the same user.
     */
    public int $reelsEngagementPerDay;

    /** Target likes_count per simple post (text / image / repost). Views are not boosted. */
    public int $simplePostLikesPerDay;

    public static function group(): string
    {
        return 'reels';
    }

    public function autoEngagementIsEnabled(): bool
    {
        return $this->autoEngagementEnabled === 1;
    }

    public function reelsEngagementTarget(): int
    {
        return max(0, min(200, (int) $this->reelsEngagementPerDay));
    }

    public function simplePostLikesTarget(): int
    {
        return max(0, min(50, (int) $this->simplePostLikesPerDay));
    }

    public function viewMinCompletionRate(): float
    {
        return max(0, min(100, $this->viewMinCompletionRatePercent)) / 100;
    }

    public function viewAllowsAnonymous(): bool
    {
        return $this->viewAllowAnonymous === 1;
    }

    public function viewUsesRedisBuffer(): bool
    {
        return $this->viewRedisBuffer === 1;
    }

    /** Laravel file `max:` rule unit (kilobytes), or null when unlimited. */
    public function maxUploadKbForValidation(): ?int
    {
        if ($this->maxUploadMb <= 0) {
            return null;
        }

        return $this->maxUploadMb * 1024;
    }

    /** Multipart chunk size in bytes (minimum 256 KB). */
    public function multipartPartSizeBytes(): int
    {
        $mb = max(1, $this->multipartPartSizeMb);

        return max(256 * 1024, $mb * 1024 * 1024);
    }
}
