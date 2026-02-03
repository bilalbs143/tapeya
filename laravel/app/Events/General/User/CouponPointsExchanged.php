<?php

namespace App\Events\General\User;

use App\Events\BaseEvent;

class CouponPointsExchanged extends BaseEvent
{
    use UserWalletUpdatable;
}
