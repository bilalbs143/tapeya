<?php

namespace App\Enums\Post;

use App\Enums\BaseEnumTrait;

enum PostReportReasonEnum: string
{
    use BaseEnumTrait;

    case Spam = 'spam';
    case Harassment = 'harassment';
    case Inappropriate = 'inappropriate';
    case Violence = 'violence';
    case Copyright = 'copyright';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Spam => 'Spam',
            self::Harassment => 'Harassment',
            self::Inappropriate => 'Inappropriate content',
            self::Violence => 'Violence',
            self::Copyright => 'Copyright',
            self::Other => 'Other',
        };
    }
}
