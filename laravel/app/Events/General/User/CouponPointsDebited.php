<?php

namespace App\Events\General\User;

use App\Events\BaseEvent;

class CouponPointsDebited extends BaseEvent
{
    use UserWalletUpdatable;
}
