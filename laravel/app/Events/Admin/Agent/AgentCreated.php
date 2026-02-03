<?php

namespace App\Events\Admin\Agent;

use App\Events\BaseEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class AgentCreated extends BaseEvent
{
    /**
     * Create a new event instance.
     */
    public function __construct(public User $user)
    {
        //
    }

    public function castTo(): Collection|User|array|null
    {
        return [];
    }
}
