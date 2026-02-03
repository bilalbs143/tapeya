<?php

namespace App\Observers;

use App\Events\Admin\ExchangeRequest\ExchangeRequestApproved;
use App\Events\Admin\ExchangeRequest\ExchangeRequestRejected;
use App\Models\ExchangeRequest;

class ExchangeRequestObserver
{
    public function created(ExchangeRequest $exchangeRequest)
    {
        $record = ExchangeRequest::pending()->find($exchangeRequest->id);
        if ($record && $record->isAutoApproved()) {
            $record->autoApprove();
        }
    }

    public function updated(ExchangeRequest $exchangeRequest)
    {
        ExchangeRequestApproved::dispatchIf($exchangeRequest->isDirty('approved_at') && $exchangeRequest->isApproved(), $exchangeRequest);
        ExchangeRequestRejected::dispatchIf($exchangeRequest->isDirty('rejected_at') && $exchangeRequest->isRejected(), $exchangeRequest);
    }
}
