<?php

namespace App\Enums\Ad;

use App\Enums\BaseEnumTrait;

enum AdCtaTypeEnum: string
{
    use BaseEnumTrait;

    case Url = 'url';
    case DeepLink = 'deep_link';
    case Whatsapp = 'whatsapp';

    public function label(): string
    {
        return match ($this) {
            self::Url => 'URL',
            self::DeepLink => 'Deep Link',
            self::Whatsapp => 'WhatsApp',
        };
    }
}
