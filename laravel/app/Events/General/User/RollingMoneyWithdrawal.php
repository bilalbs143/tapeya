<?php

namespace App\Events\General\User;

use App\Events\BaseEvent;

class RollingMoneyWithdrawal extends BaseEvent
{
    use UserWalletUpdatable;
}
