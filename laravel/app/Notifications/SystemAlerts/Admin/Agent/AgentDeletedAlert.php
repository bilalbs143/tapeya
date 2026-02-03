<?php

namespace App\Notifications\SystemAlerts\Admin\Agent;

use App\Models\User;
use App\Notifications\SystemAlerts\BaseSystemAlert;

class AgentDeletedAlert extends BaseSystemAlert
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
        return $this->userSlackAlert($this->user, 'agent_deleted', $this->user?->deletor?->name, 'deleted_by');
    }
}
