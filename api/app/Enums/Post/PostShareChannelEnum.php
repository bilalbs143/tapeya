<?php

namespace App\Enums\Post;

use App\Enums\BaseEnumTrait;

enum PostShareChannelEnum: string
{
    use BaseEnumTrait;

    case CopyLink = 'copy_link';
    case Whatsapp = 'whatsapp';
    case SystemShare = 'system_share';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::CopyLink => 'Copy link',
            self::Whatsapp => 'WhatsApp',
            self::SystemShare => 'System share',
            self::Other => 'Other',
        };
    }
}
