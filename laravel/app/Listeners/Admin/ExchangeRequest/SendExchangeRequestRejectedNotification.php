<?php

namespace App\Listeners\Admin\ExchangeRequest;

use App\Events\Admin\ExchangeRequest\ExchangeRequestRejected;
use App\Listeners\BaseListener;
use App\Notifications\SystemAlerts\Admin\ExchangeRequest\ExchangeRequestRejectedAlert;
use App\Utils\Services\NotificationService;

class SendExchangeRequestRejectedNotification extends BaseListener
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
    public function handle(ExchangeRequestRejected $event): void
    {
        NotificationService::sendSlackAlert(new ExchangeRequestRejectedAlert($event->exchangeRequest));
    }
}
