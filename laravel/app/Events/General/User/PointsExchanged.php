<?php

namespace App\Events\General\User;

use App\Events\BaseEvent;

class PointsExchanged extends BaseEvent
{
    use UserWalletUpdatable;
}
