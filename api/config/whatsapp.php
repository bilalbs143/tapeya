<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Meta WhatsApp Business API
    |--------------------------------------------------------------------------
    |
    | phone_number_id, access_token, api_version, base_url, and the auth template
    | name/language come from {@see \App\Settings\WhatsAppSettings}, not this file.
    |
    */

    'phone_number_id' => null,

    'access_token' => null,

    'api_version' => null,

    'base_url' => null,

    'templates' => [

        'auth' => [
            'name' => null,
            'language' => null,
        ],

    ],

];
