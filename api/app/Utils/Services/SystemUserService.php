<?php

namespace App\Utils\Services;

use App\Enums\User\UserTypeEnum;
use App\Models\User;

class SystemUserService
{
    public static function get(): ?User
    {
        return User::where('type', UserTypeEnum::SYSTEM)->first();
    }
}
