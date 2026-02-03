<?php

namespace App\Events\Admin\Agent;

use App\Events\BaseEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class AgentUpdated extends BaseEvent
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
        return [];
    }
}
