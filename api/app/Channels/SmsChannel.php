<?php

namespace App\Channels;

use App\Services\Notifications\SmsSender;
use Illuminate\Notifications\Notification;

class SmsChannel
{
    public function __construct(
        private SmsSender $sms
    ) {}

    /**
     * Send the given notification via SMS.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        $message = $notification->toSms($notifiable);
        if ($message === null || $message === '') {
            return;
        }

        $to = $notifiable->routeNotificationFor('sms');
        if ($to === null || $to === '') {
            return;
        }

        $this->sms->send($to, $message);
    }
}
