<?php

return [
    /*
    |--------------------------------------------------------------------------
    | QR Code Expiry Days
    |--------------------------------------------------------------------------
    |
    | How many days QR codes should remain valid before expiring.
    | QR codes are stored in the database and automatically regenerated when expired.
    | Default: 60 (2 months)
    |
    */
    'expiry_days' => env('QR_CODE_EXPIRY_DAYS', 60),

    /*
    |--------------------------------------------------------------------------
    | Default QR Code Size
    |--------------------------------------------------------------------------
    |
    | Default size for generated QR codes in pixels.
    |
    */
    'size' => env('QR_CODE_SIZE', 300),

    /*
    |--------------------------------------------------------------------------
    | Default QR Code Format
    |--------------------------------------------------------------------------
    |
    | Default format for QR codes. Supported: png, gif, jpg, svg
    |
    */
    'format' => env('QR_CODE_FORMAT', 'png'),

    /*
    |--------------------------------------------------------------------------
    | QR Code Options
    |--------------------------------------------------------------------------
    |
    | Additional options for QR code generation
    |
    */
    'options' => [
        'error_correction' => env('QR_CODE_ERROR_CORRECTION', 'M'), // L, M, Q, H
        'margin' => env('QR_CODE_MARGIN', 2),
        'encoding' => env('QR_CODE_ENCODING', 'UTF-8'),
    ],
];
