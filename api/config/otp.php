<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Test phone numbers (OTP visible in API + app UI)
    |--------------------------------------------------------------------------
    |
    | Comma-separated E.164-style numbers (e.g. +923216516130,+15551234567).
    | For these numbers only (when APP_DEBUG is false):
    | - SMS is still sent (same as production).
    | - The OTP is also included in register / request-otp JSON (like APP_DEBUG),
    |   so the app OTP screen can show it for QA.
    |
    | Leave empty in production unless you intentionally use burner test SIMs.
    |
    */
    'test_phone_numbers' => array_values(array_filter(array_map(
        static fn (string $p) => trim($p),
        explode(',', (string) env('TEST_OTP_PHONES', ''))
    ))),

];
