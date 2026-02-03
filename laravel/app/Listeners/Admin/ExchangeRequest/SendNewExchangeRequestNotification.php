<?php

namespace App\Listeners\Admin\ExchangeRequest;

use App\Events\User\ExchangeRequest\NewExchangeRequest;
use App\Listeners\BaseListener;
use App\Notifications\SystemAlerts\Admin\ExchangeRequest\NewExchangeRequestAlert;
use App\Utils\Services\NotificationService;

class SendNewExchangeRequestNotification extends BaseListener
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
    public function handle(NewExchangeRequest $event): void
    {
        NotificationService::sendSlackAlert(new NewExchangeRequestAlert($event->exchangeRequest));
    }
}
