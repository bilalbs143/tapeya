<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Admin notification recipients
    |--------------------------------------------------------------------------
    |
    | Order placed (and similar) flows: comma-separated admin addresses receive
    | mail-only alerts (see OrderPlacedAdminNotification). Live values come from
    | {@see \App\Settings\AdminNotificationSettings} (spatie/laravel-settings), not this file.
    |
    */
    'admin_emails' => [],

    /*
    |--------------------------------------------------------------------------
    | SMS
    |--------------------------------------------------------------------------
    |
    | Drivers: log, null, veevotech, whatsapp (see SmsSender). SMS driver and OTP template live in
    | {@see \App\Settings\SmsSettings}; VeevoTech URL, hash, and sender live in {@see \App\Settings\VeevoTechSmsSettings}.
    */
    'sms' => [
        'driver' => null,
        'from' => null,
        'otp_message' => null,
    ],

];
