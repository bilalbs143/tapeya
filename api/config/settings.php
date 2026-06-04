<?php

use App\Settings\AdminNotificationSettings;
use App\Settings\AppStoreSettings;
use App\Settings\ContactSettings;
use App\Settings\GeneralSettings;
use App\Settings\LiveChatSettings;
use App\Settings\OtpSettings;
use App\Settings\OverlaySettings;
use App\Settings\PushSettings;
use App\Settings\SmsSettings;
use App\Settings\StreamingSettings;
use App\Settings\VeevoTechSmsSettings;
use App\Settings\WhatsAppSettings;
use Spatie\LaravelSettings\Encryption\DefaultEncryptor;

/*
|--------------------------------------------------------------------------
| spatie/laravel-settings — configuration
|--------------------------------------------------------------------------
|
| Published by: spatie/laravel-settings v3
| Docs: https://github.com/spatie/laravel-settings
|
*/

return [
    /*
     * Each Settings class must be listed here so the package knows about it.
     * Auto-discovery is also possible via `auto_discover_settings`.
     */
    'settings' => [
        GeneralSettings::class,
        AppStoreSettings::class,
        ContactSettings::class,
        AdminNotificationSettings::class,
        OverlaySettings::class,
        OtpSettings::class,
        SmsSettings::class,
        VeevoTechSmsSettings::class,
        WhatsAppSettings::class,
        StreamingSettings::class,
        LiveChatSettings::class,
        PushSettings::class,
    ],

    /*
     * The path(s) to scan for Settings classes when using auto-discovery.
     * Leave empty to disable auto-discovery (explicit list above is sufficient).
     */
    'auto_discover_settings' => [],

    /*
     * Path used when generating/publishing the settings migrations.
     */
    'migrations_path' => database_path('migrations'),

    /*
     * The database table used to store settings.
     */
    'table' => env('SETTINGS_TABLE', 'settings'),

    /*
     * The database connection to use (null = default).
     */
    'connection' => null,

    /*
     * Caching configuration.
     * Enable in production to avoid a DB hit per request.
     */
    'cache' => [
        'enabled' => env('SETTINGS_CACHE_ENABLED', false),
        'store' => null,
        'prefix' => 'laravel.settings.',
        'ttl' => null,
    ],

    /*
     * Encryption configuration.
     * Encrypted settings properties use this cipher under the hood.
     */
    'encryption' => [
        'cipher' => DefaultEncryptor::class,
    ],

    /*
     * When true, settings will be locked after a migration is run.
     */
    'lock_after_migration' => false,

    /*
     * When true, uninitialized settings properties will return null
     * instead of throwing a SettingNotFound exception.
     */
    'default_null' => false,
];
