<?php

namespace App\Listeners\Admin\Agent;

use App\Events\Admin\Agent\AgentCreated;
use App\Listeners\BaseListener;
use App\Notifications\SystemAlerts\Admin\Agent\AgentCreatedAlert;
use App\Utils\Services\NotificationService;

class SendAgentCreatedNotification extends BaseListener
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
    public function handle(AgentCreated $event): void
    {
        NotificationService::sendSlackAlert(new AgentCreatedAlert($event->user));
    }
}
