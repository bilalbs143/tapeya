<?php

/*
 * This file is part of the Laravel NOWPayments package.
 *
 * (c) Prevail Ejimadu <prevailexcellent@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

return [

    /**
     * API Key From NOWPayments Dashboard
     */
    'apiKey' => env('NOWPAYMENTS_API_KEY'),

    /**
     * IPN Secret from NOWPayments Dashboard (for payments)
     */
    'ipnSecret' => env('NOWPAYMENTS_IPN_SECRET'),

    /**
     * Payout IPN Secret from NOWPayments Dashboard (for withdrawals)
     */
    'payoutIpnSecret' => env('NOWPAYMENTS_PAYOUT_IPN_SECRET', env('NOWPAYMENTS_IPN_SECRET')),

    /**
     * You enviroment can either be live or sandbox.
     * Make sure to add the appropriate API key after changing the enviroment in .env
     */
    'env' => env('NOWPAYMENTS_ENV', 'sandbox'),

    /**
     * NOWPayments Live URL
     */
    'liveUrl' => env('NOWPAYMENTS_LIVE_URL', 'https://api.nowpayments.io/v1'),

    /**
     * NOWPayments Sandbox URL
     */
    'sandboxUrl' => env('NOWPAYMENTS_SANDBOX_URL', 'https://api-sandbox.nowpayments.io/v1'),

    /**
     * Your callback URL
     */
    'callbackUrl' => env('NOWPAYMENTS_CALLBACK_URL'),

    /**
     * Your URL Path
     */
    'path' => 'laravel-nowpayments',

    /**
     * You can add your custom middleware to access the dashboard here
     */
    'middleware' => null, // "Authorise::class",

    /**
     * Your Nowpayment email here
     */
    'email' => env('NOWPAYMENTS_EMAIL'),

    /**
     * Your Nowpayment password here
     */
    'password' => env('NOWPAYMENTS_PASSWORD'),

    /**
     * Admin email for crypto withdrawal notifications
     */
    'adminEmail' => env('NOTIFY_ADMIN_EMAIL', 'admin@example.com'),

    /**
     * Support email for user communications
     */
    'supportEmail' => env('SUPPORT_EMAIL', 'support@artchip.com'),

    /**
     * 2FA Secret for automatic payout verification
     */
    'twoFactorSecret' => env('NOWPAYMENTS_2FA_SECRET'),

    /**
     * Main USDT wallet for conversions (usdt, usdterc20, usdttrc20, usdtpolygon)
     */
    'mainWallet' => env('NOWPAYMENTS_MAIN_WALLET', 'usdt'),

];
