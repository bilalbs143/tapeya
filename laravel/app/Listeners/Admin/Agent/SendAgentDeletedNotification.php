<?php

namespace App\Listeners\Admin\Agent;

use App\Events\Admin\Agent\AgentDeleted;
use App\Listeners\BaseListener;
use App\Notifications\SystemAlerts\Admin\Agent\AgentDeletedAlert;
use App\Utils\Services\NotificationService;

class SendAgentDeletedNotification extends BaseListener
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
    public function handle(AgentDeleted $event): void
    {
        NotificationService::sendSlackAlert(new AgentDeletedAlert($event->user));
    }
}
