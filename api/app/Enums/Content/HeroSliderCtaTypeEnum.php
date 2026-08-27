<?php

namespace App\Enums\Content;

use App\Enums\BaseEnumTrait;

enum HeroSliderCtaTypeEnum: string
{
    use BaseEnumTrait;

    case NONE = 'none';
    case URL = 'url';
    case DIALOG = 'dialog';

    public function label(): string
    {
        return match ($this) {
            self::NONE => 'Image Only',
            self::URL => 'Link',
            self::DIALOG => 'Open Dialog',
        };
    }
}
