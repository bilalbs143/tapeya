<?php

namespace App\Enums\SystemSetting;

use App\Enums\BaseEnumTrait;

enum SystemSettingGroupEnum: string
{
    use BaseEnumTrait;

    case APP = 'app';
    case GENERAL = 'general';
    case ADMIN = 'admin';
    case USER = 'user';
}
