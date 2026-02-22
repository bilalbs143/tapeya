<?php

namespace App\Services\Notifications\Drivers;

use App\Contracts\Notifications\SmsDriverInterface;
use Illuminate\Support\Facades\Log;

class LogSmsDriver implements SmsDriverInterface
{
    public function send(string $to, string $message): void
    {
        Log::channel('single')->info('SMS (log driver)', [
            'to' => $to,
            'message' => $message,
        ]);
    }
}
