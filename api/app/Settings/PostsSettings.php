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
     * Max likes auto-applied to a reel per calendar day.
     * Fresh posts roll in the upper band ({@see dailyDripRange()}); mature posts use
     * {@see matureDailyDripRange()}. Soft like lifetime = daily × fresh days.
     */
    public int $reelsEngagementPerDay;

    /** Floor of daily random drip as a fraction of daily max (keeps days from rolling near 1). */
    public const AUTO_ENGAGEMENT_DAILY_FLOOR_RATIO = 0.7;

    /**
     * Mature posts (> fresh window) use this fraction of the daily max as their slow ceiling.
     * Example: daily 50 → mature daily max 10.
     */
    public const AUTO_ENGAGEMENT_MATURE_DAILY_RATIO = 0.2;

    /** Aggressive boost window in days; also used as soft-lifetime multiplier. */
    public const AUTO_ENGAGEMENT_FRESH_DAYS = 30;

    /**
     * Soft lifetime / daily view room vs likes for reels (likes must stay strictly below views).
     * Example: like lifetime 1500 → view lifetime 1800.
     */
    public const AUTO_ENGAGEMENT_VIEW_TO_LIKE_RATIO = 1.2;

    /** Simple posts get this fraction of the reel daily max (likes only). */
    public const AUTO_ENGAGEMENT_SIMPLE_RATIO = 0.6;

    /**
     * Daily auto-comment cap vs daily like max (comments stay far below likes).
     * Example: 50 likes/day → 2 comments/day.
     */
    public const AUTO_COMMENT_DAILY_RATIO = 0.04;

    /** Comments must stay below this fraction of likes on the post. */
    public const AUTO_COMMENT_TO_LIKE_RATIO = 0.08;

    public static function group(): string
    {
        return 'reels';
    }

    public function autoEngagementIsEnabled(): bool
    {
        return $this->autoEngagementEnabled === 1;
    }

    /** Max auto likes/views per reel per calendar day. */
    public function reelsDailyMax(): int
    {
        return max(0, min(50, (int) $this->reelsEngagementPerDay));
    }

    /** Max auto likes per simple post per calendar day. */
    public function simpleDailyMax(): int
    {
        return max(0, min(30, (int) round($this->reelsDailyMax() * self::AUTO_ENGAGEMENT_SIMPLE_RATIO)));
    }

    /**
     * Soft ceiling so a post cannot grow forever (daily max × freshness window).
     */
    public function reelsLifetimeMax(): int
    {
        return $this->reelsDailyMax() * self::AUTO_ENGAGEMENT_FRESH_DAYS;
    }

    /** Soft view ceiling for reels — always above like lifetime so likes can stay behind views. */
    public function reelsViewsLifetimeMax(): int
    {
        return $this->scaleViewsAboveLikes($this->reelsLifetimeMax());
    }

    /**
     * Scale a like count into a slightly higher view budget (likes must stay below views).
     * Example: 1500 → 1800 at ratio 1.2.
     */
    public function scaleViewsAboveLikes(int $likes): int
    {
        if ($likes <= 0) {
            return 0;
        }

        return max($likes + 1, (int) ceil($likes * self::AUTO_ENGAGEMENT_VIEW_TO_LIKE_RATIO));
    }

    /** @deprecated Use {@see scaleViewsAboveLikes()} */
    public function dailyViewQuotaForLikeQuota(int $likeQuota): int
    {
        return $this->scaleViewsAboveLikes($likeQuota);
    }

    public function simpleLifetimeMax(): int
    {
        return $this->simpleDailyMax() * self::AUTO_ENGAGEMENT_FRESH_DAYS;
    }

    public function reelsCommentDailyMax(): int
    {
        return $this->commentDailyMaxFromLikes($this->reelsDailyMax());
    }

    public function simpleCommentDailyMax(): int
    {
        return $this->commentDailyMaxFromLikes($this->simpleDailyMax());
    }

    public function reelsCommentLifetimeMax(): int
    {
        return $this->reelsCommentDailyMax() * self::AUTO_ENGAGEMENT_FRESH_DAYS;
    }

    public function simpleCommentLifetimeMax(): int
    {
        return $this->simpleCommentDailyMax() * self::AUTO_ENGAGEMENT_FRESH_DAYS;
    }

    public function commentDailyMaxFromLikes(int $likeDailyMax): int
    {
        if ($likeDailyMax <= 0) {
            return 0;
        }

        return max(1, (int) round($likeDailyMax * self::AUTO_COMMENT_DAILY_RATIO));
    }

    public function commentCapFromLikes(int $likesCount): int
    {
        if ($likesCount <= 0) {
            return 0;
        }

        return max(0, (int) floor($likesCount * self::AUTO_COMMENT_TO_LIKE_RATIO));
    }

    public function autoEngagementFreshDays(): int
    {
        return self::AUTO_ENGAGEMENT_FRESH_DAYS;
    }

    /**
     * Inclusive random daily drip range for a given daily max.
     * Uses the upper band so days stay aggressive (e.g. 50 → 35…50).
     *
     * @return array{0: int, 1: int} [min, max]
     */
    public function dailyDripRange(int $dailyMax): array
    {
        if ($dailyMax <= 0) {
            return [0, 0];
        }

        $min = max(1, (int) ceil($dailyMax * self::AUTO_ENGAGEMENT_DAILY_FLOOR_RATIO));

        return [min($min, $dailyMax), $dailyMax];
    }

    /**
     * Slow daily drip band for posts older than the fresh window.
     * Uses ~{@see AUTO_ENGAGEMENT_MATURE_DAILY_RATIO} of the fresh daily max (e.g. 50 → 1…10).
     *
     * @return array{0: int, 1: int} [min, max]
     */
    public function matureDailyDripRange(int $freshDailyMax): array
    {
        if ($freshDailyMax <= 0) {
            return [0, 0];
        }

        $matureMax = max(1, (int) round($freshDailyMax * self::AUTO_ENGAGEMENT_MATURE_DAILY_RATIO));

        return [1, $matureMax];
    }

    /** @deprecated Use {@see reelsLifetimeMax()} */
    public function reelsEngagementTarget(): int
    {
        return $this->reelsLifetimeMax();
    }

    /** @deprecated Use {@see simpleLifetimeMax()} */
    public function simplePostLikesTarget(): int
    {
        return $this->simpleLifetimeMax();
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
        // Floor at 5MB: 1MB parts force a CORS preflight per chunk on Capacitor
        // WebViews and amplify mid-upload FETCH_ERROR aborts on mobile.
        $mb = max(5, $this->multipartPartSizeMb);

        return max(256 * 1024, $mb * 1024 * 1024);
    }
}
