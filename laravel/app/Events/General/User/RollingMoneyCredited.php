<?php

namespace App\Events\General\User;

use App\Events\BaseEvent;

class RollingMoneyCredited extends BaseEvent
{
    use UserWalletUpdatable;
}
