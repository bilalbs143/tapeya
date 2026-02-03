<?php

namespace App\Events\General\User;

use App\Events\BaseEvent;

class UserWalletUpdated extends BaseEvent
{
    use UserWalletUpdatable;
}
