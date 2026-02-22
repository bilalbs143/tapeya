<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Admin notification recipients
    |--------------------------------------------------------------------------
    |
    | - Admin users (User type=administrator): receive mail + database (stored in `notifications` table).
    | - Optional: extra emails here receive mail only (e.g. shared inbox). Comma-separated.
    |
    */
    'admin_emails' => array_filter(array_map('trim', explode(',', env('NOTIFICATION_ADMIN_EMAILS', '')))),

    /*
    |--------------------------------------------------------------------------
    | SMS
    |--------------------------------------------------------------------------
    |
    | Drivers: "log" (development), "null" (disable), "api" (generic HTTP SMS – config in services.sms).
    | When you finalise a provider, set SMS_DRIVER=api and update ApiSmsDriver + services.sms to match.
    |
    */
    'sms' => [
        'driver' => env('SMS_DRIVER', 'log'),
        'from' => env('SMS_FROM', env('APP_NAME', 'Tapeya')),
    ],

];
