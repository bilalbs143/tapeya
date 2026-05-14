<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Test phone numbers (OTP visible in API + app UI)
    |--------------------------------------------------------------------------
    |
    | Live list comes from {@see \App\Settings\OtpSettings::testPhoneNumbers}. For those numbers
    | SMS is skipped; OTP appears in register / request-otp JSON for QA.
    |
    */
    'test_phone_numbers' => [],

];
