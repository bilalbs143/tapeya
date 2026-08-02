<?php

namespace App\Enums\Post;

use App\Enums\BaseEnumTrait;

/**
 * Pipeline status for upload / FFmpeg compression (video) or immediate publish (text/image/repost).
 * Feed eligibility uses published_at + visibility — not Ready vs Processing.
 */
enum PostStatusEnum: string
{
    use BaseEnumTrait;

    case Uploading = 'uploading';
    case Processing = 'processing';
    case Ready = 'ready';
    case Failed = 'failed';
    case Rejected = 'rejected';
    case Removed = 'removed';

    public function label(): string
    {
        return match ($this) {
            self::Uploading => 'Uploading',
            self::Processing => 'Processing',
            self::Ready => 'Ready',
            self::Failed => 'Failed',
            self::Rejected => 'Rejected',
            self::Removed => 'Removed',
        };
    }

    /** Terminal / incomplete — never show in public feeds or interactions. */
    public function isUnavailable(): bool
    {
        return match ($this) {
            self::Uploading, self::Failed, self::Rejected, self::Removed => true,
            self::Processing, self::Ready => false,
        };
    }
}
