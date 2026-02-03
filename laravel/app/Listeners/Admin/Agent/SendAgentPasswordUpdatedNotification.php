<?php

namespace App\Listeners\Admin\Agent;

use App\Events\Admin\Agent\AgentPasswordUpdated;
use App\Listeners\BaseListener;
use App\Notifications\SystemAlerts\Admin\Agent\AgentPasswordUpdatedAlert;
use App\Utils\Services\NotificationService;

class SendAgentPasswordUpdatedNotification extends BaseListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(AgentPasswordUpdated $event): void
    {
        NotificationService::sendSlackAlert(new AgentPasswordUpdatedAlert($event->user));
    }
}
