<?php

/*
 * Cryptoments Payment Gateway Configuration
 */

return [

    /**
     * API Key From Cryptoments Dashboard
     */
    'apiKey' => env('CRYPTOMENTS_API_KEY'),

    /**
     * API Secret From Cryptoments Dashboard (for HMAC-SHA256 signature)
     * Also used for webhook callback signature verification
     */
    'apiSecret' => env('CRYPTOMENTS_API_SECRET'),

    /**
     * Callback Secret Key for webhook signature verification (HMAC-SHA256)
     * Defaults to apiSecret if not provided
     */
    'callbackSecretKey' => env('CRYPTOMENTS_CALLBACK_SECRET_KEY', env('CRYPTOMENTS_API_SECRET')),

    /**
     * API URL for Cryptoments
     */
    'apiUrl' => env('CRYPTOMENTS_API_URL', 'https://api.cryptoments.net'),

    /**
     * Partner ID from Cryptoments Dashboard
     */
    'partnerId' => env('CRYPTOMENTS_PARTNER_ID', 1),

    /**
     * Environment can be either live or sandbox
     */
    'env' => env('CRYPTOMENTS_ENV', 'sandbox'),

    /**
     * Enable/disable Cryptoments integration
     */
    'enabled' => env('CRYPTOMENTS_ENABLED', false),

    /**
     * Admin email for crypto withdrawal notifications
     */
    'adminEmail' => env('NOTIFY_ADMIN_EMAIL', 'admin@example.com'),

];
