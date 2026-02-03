<?php

namespace App\Events\General\User;

use App\Events\BaseEvent;

class LosingMoneyDebited extends BaseEvent
{
    use UserWalletUpdatable;
}
