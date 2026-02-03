<?php

namespace App\Observers;

use App\Models\WhitelistedIp;
use App\Utils\Services\CacheService;

class WhitelistedIpObserver
{
    public function created(WhitelistedIp $whitelistedIp)
    {
        CacheService::flush($whitelistedIp->kebab());
    }

    public function updated(WhitelistedIp $whitelistedIp)
    {
        CacheService::flush($whitelistedIp->kebab());
    }
}
