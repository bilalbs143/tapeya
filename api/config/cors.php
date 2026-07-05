<?php

$allowedOrigins = env('CORS_ALLOWED_ORIGINS');

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Production: set CORS_ALLOWED_ORIGINS to a comma-separated list including
    | https://graphics.tapeya.com (overlay / vMix browser source).
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

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
