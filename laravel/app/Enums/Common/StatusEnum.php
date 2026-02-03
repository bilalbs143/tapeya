<?php

namespace App\Enums\Common;

use App\Enums\BaseEnumTrait;

enum StatusEnum: string
{
    use BaseEnumTrait;

    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
}
