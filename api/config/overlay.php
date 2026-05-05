<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Overlay URL signing (OBS / browser source)
    |--------------------------------------------------------------------------
    |
    | HMAC secret for ?expires=&signature= on graphic overlay links. If null,
    | APP_KEY is used — prefer a dedicated OVERLAY_SIGNING_SECRET in production
    | so overlay links can be rotated without rotating the app encryption key.
    |
    */

    'signing_secret' => env('OVERLAY_SIGNING_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Frontend base URL (React app)
    |--------------------------------------------------------------------------
    |
    | Used when the admin API builds the full overlay URL for operators to
    | paste into OBS. Must match where the user app is actually served.
    |
    */

    'frontend_base_url' => rtrim((string) env('OVERLAY_FRONTEND_URL', 'http://localhost:5173'), '/'),

    /*
    |--------------------------------------------------------------------------
    | Signed overlay link lifetime
    |--------------------------------------------------------------------------
    |
    | Seconds until ?expires= for generated OBS overlay URLs (default 86400 =
    | 24 hours). Override with OVERLAY_DEFAULT_TTL_SECONDS when you need a
    | different deployment-wide default.
    |
    */

    'default_ttl_seconds' => (int) env('OVERLAY_DEFAULT_TTL_SECONDS', 86400),

];
