<?php

namespace App\Notifications\SystemAlerts\Admin\Agent;

use App\Models\User;
use App\Notifications\SystemAlerts\BaseSystemAlert;

class AgentPasswordUpdatedAlert extends BaseSystemAlert
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
        return $this->userSlackAlert($this->user, 'password_updated', $this->user?->editor?->name, 'updated_by');
    }
}
