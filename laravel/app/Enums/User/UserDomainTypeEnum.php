<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum UserDomainTypeEnum: string
{
    use BaseEnumTrait;

    case DOMAIN = 'domain';
    case TELEGRAM = 'telegram';
    case KAKAO_TALK = 'kakao_talk';
}
