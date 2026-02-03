<?php

namespace App\Events\General\User;

use App\Events\BaseEvent;

class LosingMoneyWithdrawal extends BaseEvent
{
    use UserWalletUpdatable;
}
