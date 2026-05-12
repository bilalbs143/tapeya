<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Meta WhatsApp Business API
    |--------------------------------------------------------------------------
    |
    | Used by WhatsAppSmsDriver when SMS_DRIVER=whatsapp.
    |
    | Required env vars:
    |   WHATSAPP_PHONE_NUMBER_ID  – numeric ID from Meta Business > Phone Numbers
    |   WHATSAPP_ACCESS_TOKEN     – permanent (system-user) access token
    |
    | Optional:
    |   WHATSAPP_API_VERSION      – Graph API version (default v25.0)
    |   WHATSAPP_API_BASE_URL     – override base URL (useful for mocking in tests)
    |
    */

    'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),

    'access_token'   => env('WHATSAPP_ACCESS_TOKEN'),

    'api_version' => env('WHATSAPP_API_VERSION', 'v25.0'),

    'base_url' => env('WHATSAPP_API_BASE_URL', 'https://graph.facebook.com'),

    /*
    |--------------------------------------------------------------------------
    | Templates
    |--------------------------------------------------------------------------
    |
    | Each key maps to a pre-approved template in Meta Business Manager.
    | Add a new entry here whenever you create a new template category.
    |
    | Keys are used by WhatsAppSmsDriver::sendTemplate($to, 'key', $components).
    | The "auth" key is reserved for OTP — it is called automatically by send()
    | via SmsChannel / OtpService with no changes required to those callers.
    |
    | Fields per template:
    |   name       – exact template name registered in Meta Business Manager
    |   language   – BCP-47 locale code (must match the approved template locale)
    |
    */

    'templates' => [

        /*
         * auth — OTP verification codes.
         * Category: Authentication (recommended) or Utility.
         * Body must contain exactly one {{1}} parameter.
         */
        'auth' => [
            'name'     => env('WHATSAPP_TEMPLATE_AUTH_NAME', 'otp'),
            'language' => env('WHATSAPP_TEMPLATE_AUTH_LANGUAGE', 'en_US'),
        ],

        /*
         * order — order placement / status notifications.
         * Category: Utility.
         * Example body: "Your order {{1}} has been placed. Total: {{2}}."
         */
        'order' => [
            'name'     => env('WHATSAPP_TEMPLATE_ORDER_NAME', 'order_confirmation'),
            'language' => env('WHATSAPP_TEMPLATE_ORDER_LANGUAGE', 'en_US'),
        ],

        /*
         * marketing — promotional broadcasts and campaigns.
         * Category: Marketing (requires user opt-in).
         */
        'marketing' => [
            'name'     => env('WHATSAPP_TEMPLATE_MARKETING_NAME', 'promo'),
            'language' => env('WHATSAPP_TEMPLATE_MARKETING_LANGUAGE', 'en_US'),
        ],

        /*
         * info — general informational / utility notifications
         * (e.g. shipping updates, reminders, event alerts).
         * Category: Utility.
         */
        'info' => [
            'name'     => env('WHATSAPP_TEMPLATE_INFO_NAME', 'info_notification'),
            'language' => env('WHATSAPP_TEMPLATE_INFO_LANGUAGE', 'en_US'),
        ],

    ],

];
