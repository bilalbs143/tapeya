<?php

namespace App\Notifications\SystemAlerts\Admin\Agent;

use App\Models\User;
use App\Notifications\SystemAlerts\BaseSystemAlert;

class AgentCreatedAlert extends BaseSystemAlert
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public User $user)
    {
        //
    }

    public function toSlack(User $notifiable)
    {
        return $this->userSlackAlert($this->user, 'agent_created', $this->user?->creator?->name, 'created_by');
    }
}
