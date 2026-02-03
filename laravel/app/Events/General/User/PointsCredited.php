<?php

namespace App\Events\General\User;

use App\Events\BaseEvent;

class PointsCredited extends BaseEvent
{
    use UserWalletUpdatable;
}
