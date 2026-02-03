<?php

namespace App\Observers;

use App\Events\General\User\UserWalletUpdated;
use App\Models\UserWallet;

class UserWalletObserver
{
    public function updating(UserWallet $userWallet)
    {
        UserWalletUpdated::dispatch($userWallet);
    }
}
