<?php

namespace App\Events\Admin\User;

use App\Events\BaseEvent;
use App\Models\AuthenticationLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class KillAuthSession extends BaseEvent
{
    /**
     * Create a new event instance.
     */
    public function __construct(public AuthenticationLog $session)
    {
        //
    }

    public function castTo(): Collection|User|array|null
    {
        return [
            $this->session?->authenticatable,
        ];
    }
}
