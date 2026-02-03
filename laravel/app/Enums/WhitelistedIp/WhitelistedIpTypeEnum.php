<?php

namespace App\Enums\WhitelistedIp;

use App\Enums\BaseEnumTrait;

enum WhitelistedIpTypeEnum: string
{
    use BaseEnumTrait;

    case ADMIN = 'admin';
}
