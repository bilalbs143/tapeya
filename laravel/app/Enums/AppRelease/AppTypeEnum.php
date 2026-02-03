<?php

namespace App\Enums\AppRelease;

use App\Enums\BaseEnumTrait;

enum AppTypeEnum: string
{
    use BaseEnumTrait;

    case RELEASE = 'release';
    case BETA = 'beta';
    case ALPHA = 'alpha';
}
