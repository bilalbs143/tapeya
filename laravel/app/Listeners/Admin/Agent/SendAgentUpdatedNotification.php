<?php

namespace App\Listeners\Admin\Agent;

use App\Events\Admin\Agent\AgentUpdated;
use App\Listeners\BaseListener;
use App\Notifications\SystemAlerts\Admin\Agent\AgentUpdatedAlert;
use App\Utils\Services\NotificationService;

class SendAgentUpdatedNotification extends BaseListener
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
    public function handle(AgentUpdated $event): void
    {
        if ($event->isUpdated) {
            NotificationService::sendSlackAlert(new AgentUpdatedAlert($event->user));
        }
    }
}
