<?php

namespace App\Services\Notifications\Drivers;

use App\Contracts\Notifications\SmsDriverInterface;

class NullSmsDriver implements SmsDriverInterface
{
    public function send(string $to, string $message): void
    {
        // No-op: disables SMS without changing notification code.
    }
}
