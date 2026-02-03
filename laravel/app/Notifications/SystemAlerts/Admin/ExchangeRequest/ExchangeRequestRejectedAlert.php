<?php

namespace App\Notifications\SystemAlerts\Admin\ExchangeRequest;

use App\Models\ExchangeRequest;
use App\Notifications\SystemAlerts\BaseSystemAlert;

class ExchangeRequestRejectedAlert extends BaseSystemAlert
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public ExchangeRequest $exchangeRequest)
    {
        //
    }

    public function toSlack()
    {
        return $this->exchangeRequestSlackAlert($this->exchangeRequest, 'exchange_request_rejected', $this->exchangeRequest->rejector?->name, 'rejected_by');
    }
}
