<?php

namespace App\Enums\AppRelease;

use App\Enums\BaseEnumTrait;

enum AppReleaseChannelEnum: string
{
    use BaseEnumTrait;

    case PRODUCTION = 'production';
    case STAGING = 'staging';
    case DEVELOPMENT = 'development';
}
