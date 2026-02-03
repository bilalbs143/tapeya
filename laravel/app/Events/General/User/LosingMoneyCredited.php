<?php

namespace App\Events\General\User;

use App\Events\BaseEvent;

class LosingMoneyCredited extends BaseEvent
{
    use UserWalletUpdatable;
}
