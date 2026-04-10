<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Capacitor / Ionic WebViews use origins like https://localhost, so browser
    | fetch() is cross-origin to the API. Preflight must include a valid
    | Access-Control-Allow-Origin. Set CORS_ALLOWED_ORIGINS in .env as a
    | comma-separated list for production web apps; native apps should use
    | CapacitorHttp (see app/capacitor.config.json).
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => collect(explode(',', (string) env('CORS_ALLOWED_ORIGINS', '*')))
        ->map(fn (string $o) => trim($o))
        ->filter()
        ->whenEmpty(fn ($c) => $c->push('*'))
        ->values()
        ->all(),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
