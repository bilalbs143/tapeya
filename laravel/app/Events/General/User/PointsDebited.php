<?php

namespace App\Events\General\User;

use App\Events\BaseEvent;

class PointsDebited extends BaseEvent
{
    use UserWalletUpdatable;
}
