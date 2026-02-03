<?php

namespace App\Events\General\User;

use App\Events\BaseEvent;

class CouponPointsCredited extends BaseEvent
{
    use UserWalletUpdatable;
}
