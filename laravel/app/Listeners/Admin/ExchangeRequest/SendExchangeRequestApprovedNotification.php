<?php

namespace App\Listeners\Admin\ExchangeRequest;

use App\Events\Admin\ExchangeRequest\ExchangeRequestApproved;
use App\Listeners\BaseListener;
use App\Notifications\SystemAlerts\Admin\ExchangeRequest\ExchangeRequestApprovedAlert;
use App\Utils\Services\NotificationService;

class SendExchangeRequestApprovedNotification extends BaseListener
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
    public function handle(ExchangeRequestApproved $event): void
    {
        NotificationService::sendSlackAlert(new ExchangeRequestApprovedAlert($event->exchangeRequest));
    }
}
