<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum UserLocaleEnum: string
{
    use BaseEnumTrait;

    case ko = 'ko';
    case en = 'en';
    case id = 'id';
    case my = 'my';
    case th = 'th';
    case tw = 'tw';
    case vn = 'vn';
    case jp = 'jp';
}
