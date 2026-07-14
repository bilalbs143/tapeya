<?php

$allowedOrigins = env('CORS_ALLOWED_ORIGINS');

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Production: set CORS_ALLOWED_ORIGINS to web origins only (tapeya.com,
    | graphics, backoffice). Capacitor/Ionic WebViews are covered by
    | allowed_origins_patterns below — do not list them in the env allowlist.
    | Local dev: leave unset to allow all origins (*).
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'broadcasting/*',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOrigins !== null && $allowedOrigins !== ''
        ? array_values(array_filter(array_map('trim', explode(',', $allowedOrigins))))
        : ['*'],

    // Capacitor / Ionic WebViews (exact Origin varies by platform + Capacitor version).
    // Keep these even when CORS_ALLOWED_ORIGINS is a restrictive production allowlist.
    'allowed_origins_patterns' => $allowedOrigins !== null && $allowedOrigins !== ''
        ? [
            '#^https?://localhost(:\d+)?$#',
            '#^capacitor://.*$#',
            '#^ionic://.*$#',
        ]
        : [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
