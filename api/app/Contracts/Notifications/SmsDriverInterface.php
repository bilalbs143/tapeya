<?php

namespace App\Contracts\Notifications;

interface SmsDriverInterface
{
    /**
     * Send an SMS to the given phone number.
     *
     * @param  non-empty-string  $to  E.164 or normalized phone
     * @param  non-empty-string  $message  Plain text body
     */
    public function send(string $to, string $message): void;
}
