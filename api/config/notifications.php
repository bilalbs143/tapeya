<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Admin notification recipients
    |--------------------------------------------------------------------------
    |
    | Order placed (and similar) flows:
    | - Customer: their own notification channels.
    | - System user (type=system): database row for the shared in-app admin inbox.
    | - NOTIFICATION_ADMIN_EMAILS: comma-separated addresses that receive mail only
    |   (e.g. hello@tapeya.com) via OrderPlacedAdminNotification.
    |
    */
    'admin_emails' => array_filter(array_map('trim', explode(',', env('NOTIFICATION_ADMIN_EMAILS', '')))),

    /*
    |--------------------------------------------------------------------------
    | SMS
    |--------------------------------------------------------------------------
    |
    | Drivers: "log" (development), "null" (disable), "api" (generic HTTP – ApiSmsDriver),
    | "veevotech" (VeevoTech v3 sendsms – set SMS_API_KEY to your API hash).
    |
    */
    'sms' => [
        'driver' => env('SMS_DRIVER', 'log'),
        'from' => env('SMS_FROM', env('APP_NAME', 'Tapeya')),
        'otp_message' => env(
            'SMS_OTP_MESSAGE',
            'Your verification code is :code. Valid for 10 minutes. Do not share this code with anyone.'
        ),
    ],

];
