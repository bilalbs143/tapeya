<?php

namespace App\Events\General\User;

use App\Events\BaseEvent;

class MoneyWithdrawal extends BaseEvent
{
    use UserWalletUpdatable;
}
