<?php

namespace App\Enums\Post;

use App\Enums\BaseEnumTrait;

enum PostTypeEnum: string
{
    use BaseEnumTrait;

    case Text = 'text';
    case Image = 'image';
    case Video = 'video';
    case Repost = 'repost';

    public function label(): string
    {
        return match ($this) {
            self::Text => 'Text',
            self::Image => 'Image',
            self::Video => 'Video',
            self::Repost => 'Repost',
        };
    }
}
