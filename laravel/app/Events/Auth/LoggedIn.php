<?php

namespace App\Events\Auth;

use App\Events\BaseEvent;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class LoggedIn extends BaseEvent
{
    /**
     * Create a new event instance.
     */
    public function __construct(public User $user, public Carbon $time)
    {
        //
    }

    public function castTo(): Collection|User|array|null
    {
        return $this->user;
    }
}
