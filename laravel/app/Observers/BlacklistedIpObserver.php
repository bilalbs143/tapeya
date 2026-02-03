<?php

namespace App\Observers;

use App\Models\BlacklistedIp;
use App\Utils\Services\CacheService;

class BlacklistedIpObserver
{
    public function created(BlacklistedIp $blacklistedIp)
    {
        CacheService::flush($blacklistedIp->kebab());
    }

    public function updated(BlacklistedIp $blacklistedIp)
    {
        CacheService::flush($blacklistedIp->kebab());
    }
}
