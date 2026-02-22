<?php

namespace App\Events;

use App\Models\Event\EventRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EventRequestSubmitted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public EventRequest $eventRequest
    ) {}
}
