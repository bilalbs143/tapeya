<?php

namespace App\Events\General\User;

use App\Events\BaseEvent;

class MoneyDeposited extends BaseEvent
{
    use UserWalletUpdatable;
}
