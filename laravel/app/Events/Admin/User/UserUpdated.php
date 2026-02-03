<?php

namespace App\Events\Admin\User;

use App\Events\BaseEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserUpdated extends BaseEvent
{
    /**
     * Create a new event instance.
     */
    public function __construct(public User $user, public bool $isUpdated = true)
    {
        //
    }

    public function castTo(): Collection|User|array|null
    {
        return [$this->user];
    }
}
