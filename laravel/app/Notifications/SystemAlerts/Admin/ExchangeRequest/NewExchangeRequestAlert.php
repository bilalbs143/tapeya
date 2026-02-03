<?php

namespace App\Notifications\SystemAlerts\Admin\ExchangeRequest;

use App\Models\ExchangeRequest;
use App\Models\User;
use App\Notifications\SystemAlerts\BaseSystemAlert;

class NewExchangeRequestAlert extends BaseSystemAlert
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public ExchangeRequest $exchangeRequest)
    {
        //
    }

    public function toSlack(User $notifiable)
    {
        return $this->exchangeRequestSlackAlert($this->exchangeRequest, 'new_exchange_request_received', $this->exchangeRequest->creator?->name, 'requested_by');
    }
}
