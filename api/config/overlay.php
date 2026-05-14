<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Overlay URL signing (OBS / browser source)
    |--------------------------------------------------------------------------
    |
    | Placeholders only. Live overlay values come from {@see \App\Settings\OverlaySettings}.
    | When signing_secret is empty, {@see \App\Services\Overlay\MatchGraphicOverlaySigner} uses APP_KEY.
    |
    */

    'signing_secret' => null,

    /*
    |--------------------------------------------------------------------------
    | Frontend base URL (React app)
    |--------------------------------------------------------------------------
    |
    | Full origin of the overlay web app (used when building signed OBS URLs).
    |
    */

    'frontend_base_url' => '',

    /*
    |--------------------------------------------------------------------------
    | Signed overlay link lifetime
    |--------------------------------------------------------------------------
    |
    | Seconds until ?expires=. Live value: {@see \App\Settings\OverlaySettings} defaultTtlSeconds (Admin → System Settings).
    |
    */

    'default_ttl_seconds' => 0,

];
