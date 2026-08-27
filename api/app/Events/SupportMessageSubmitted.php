<?php

namespace App\Events;

use App\Models\SupportMessage;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SupportMessageSubmitted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public SupportMessage $supportMessage
    ) {}
}
