<?php

namespace App\Enums\AppRelease;

use App\Enums\BaseEnumTrait;

enum AppOsEnum: string
{
    use BaseEnumTrait;

    case IOS = 'ios';
    case ANDROID = 'android';

    public function extension(): string
    {
        return match ($this) {
            self::IOS => 'ipa',
            self::ANDROID => 'apk',
        };
    }
}
