<?php

namespace App\Models;

use App\Enums\User\UserDomainTypeEnum;

class UserDomain extends BaseModel
{
    protected $fillable = [
        'user_id',
        'type',
        'data',
    ];

    protected $casts = [
        'type' => UserDomainTypeEnum::class,
    ];
}
