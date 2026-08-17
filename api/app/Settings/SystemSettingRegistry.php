<?php

namespace App\Settings;

use App\Enums\SystemSetting\SystemSettingGroupEnum;
use App\Enums\SystemSetting\SystemSettingKeyEnum;
use App\Enums\SystemSetting\SystemSettingTypeEnum;
use App\Services\Notifications\SmsSender;
use App\Support\Media\MediaCdn;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Spatie\LaravelSettings\Settings;

/**
 * Single source for system settings metadata, Spatie bindings, API (de)serialization,
 * and admin PATCH validation rules. {@see SystemSettingKeyEnum} stays a slim backed enum.
 */
final class SystemSettingRegistry
{
    /**
     * @return array{
     *     group: SystemSettingGroupEnum,
     *     type: SystemSettingTypeEnum,
     *     label: string,
     *     description: string,
     *     settings_class: class-string<Settings>,
     *     property: string,
     *     nullable_string: bool,
     * }
     */
    public static function meta(SystemSettingKeyEnum $key): array
    {
        if (! self::isRegistered($key)) {
            throw new \InvalidArgumentException('Unknown or retired system setting: '.$key->value);
        }

        return self::definitions()[$key->value];
    }

    public static function isRegistered(SystemSettingKeyEnum $key): bool
    {
        return array_key_exists($key->value, self::definitions());
    }

    public static function group(SystemSettingKeyEnum $key): SystemSettingGroupEnum
    {
        return self::meta($key)['group'];
    }

    public static function type(SystemSettingKeyEnum $key): SystemSettingTypeEnum
    {
        return self::meta($key)['type'];
    }

    public static function label(SystemSettingKeyEnum $key): string
    {
        return self::meta($key)['label'];
    }

    public static function description(SystemSettingKeyEnum $key): string
    {
        return self::meta($key)['description'];
    }

    public static function read(SystemSettingKeyEnum $key): mixed
    {
        $m = self::meta($key);
        $class = $m['settings_class'];
        $property = $m['property'];

        return app($class)->{$property};
    }

    public static function write(SystemSettingKeyEnum $key, mixed $value): void
    {
        $m = self::meta($key);
        $class = $m['settings_class'];
        $settings = app($class);
        $settings->{$m['property']} = $value;
        $settings->save();

        if ($key === SystemSettingKeyEnum::CDN_PUBLIC_BASE_URL) {
            MediaCdn::applyToFilesystemConfig();
        }
    }

    public static function serialize(SystemSettingKeyEnum $key, mixed $raw): mixed
    {
        return match ($key) {
            SystemSettingKeyEnum::NOTIFICATION_ADMIN_EMAILS,
            SystemSettingKeyEnum::TEST_OTP_PHONES => is_array($raw) ? implode(', ', $raw) : $raw,
            default => $raw,
        };
    }

    public static function deserialize(SystemSettingKeyEnum $key, mixed $apiValue): mixed
    {
        return match ($key) {
            SystemSettingKeyEnum::NOTIFICATION_ADMIN_EMAILS => self::splitCommaEmails($apiValue),
            SystemSettingKeyEnum::TEST_OTP_PHONES => self::splitCommaPhones($apiValue),
            default => $apiValue,
        };
    }

    /**
     * @return array<string, mixed>
     */
    public static function rules(SystemSettingKeyEnum $key): array
    {
        return match ($key) {
            SystemSettingKeyEnum::DEFAULT_CURRENCY => [
                'value' => ['required', 'string', 'size:3', 'regex:/^[A-Z]{3}$/'],
            ],
            SystemSettingKeyEnum::TIMEZONE => [
                'value' => ['required', 'timezone:all'],
            ],
            SystemSettingKeyEnum::IOS_APP_STORE_URL,
            SystemSettingKeyEnum::ANDROID_PLAY_STORE_URL,
            SystemSettingKeyEnum::PUBLIC_WEBSITE_URL,
            SystemSettingKeyEnum::CDN_PUBLIC_BASE_URL => [
                'value' => ['nullable', 'string', 'url', 'max:2048'],
            ],
            SystemSettingKeyEnum::IOS_APP_STORE_VERSION,
            SystemSettingKeyEnum::ANDROID_PLAY_STORE_VERSION => [
                'value' => ['nullable', 'string', 'max:32'],
            ],
            SystemSettingKeyEnum::SUPPORT_EMAIL => [
                'value' => ['nullable', 'string', 'email', 'max:255'],
            ],
            SystemSettingKeyEnum::SUPPORT_PHONE => [
                'value' => ['nullable', 'string', 'max:32'],
            ],
            SystemSettingKeyEnum::NOTIFICATION_ADMIN_EMAILS => [
                'value' => ['nullable', 'string', 'max:5000'],
            ],
            SystemSettingKeyEnum::GRAPHICS_FRONTEND_URL => [
                'value' => ['nullable', 'string', 'url', 'max:2048'],
            ],
            SystemSettingKeyEnum::GRAPHICS_DEFAULT_TTL_SECONDS => [
                'value' => ['nullable', 'integer', 'min:60', 'max:2592000'],
            ],
            SystemSettingKeyEnum::GRAPHICS_SIGNING_SECRET => [
                'value' => ['nullable', 'string', 'max:512'],
            ],
            SystemSettingKeyEnum::TEST_OTP_PHONES => [
                'value' => ['nullable', 'string', 'max:2000'],
            ],
            SystemSettingKeyEnum::SMS_DRIVER => [
                'value' => ['nullable', 'string', Rule::in(SmsSender::configuredDriverNames())],
            ],
            SystemSettingKeyEnum::SMS_OTP_MESSAGE => [
                'value' => ['nullable', 'string', 'max:2000'],
            ],
            SystemSettingKeyEnum::SMS_FROM => [
                'value' => ['nullable', 'string', 'max:128'],
            ],
            SystemSettingKeyEnum::SMS_VEEVOTECH_API_URL => [
                'value' => ['nullable', 'string', 'url', 'max:512'],
            ],
            SystemSettingKeyEnum::SMS_VEEVOTECH_API_KEY => [
                'value' => ['nullable', 'string', 'max:512'],
            ],
            SystemSettingKeyEnum::WHATSAPP_PHONE_NUMBER_ID => [
                'value' => ['nullable', 'string', 'max:32', 'regex:/^[0-9]+$/'],
            ],
            SystemSettingKeyEnum::WHATSAPP_ACCESS_TOKEN => [
                'value' => ['nullable', 'string', 'max:8192'],
            ],
            SystemSettingKeyEnum::WHATSAPP_API_VERSION => [
                'value' => ['nullable', 'string', 'max:16', 'regex:/^v?[0-9]+(\.[0-9]+)*$/'],
            ],
            SystemSettingKeyEnum::WHATSAPP_API_BASE_URL => [
                'value' => ['nullable', 'string', 'url', 'max:512'],
            ],
            SystemSettingKeyEnum::WHATSAPP_TEMPLATE_AUTH_NAME => [
                'value' => ['nullable', 'string', 'max:128'],
            ],
            SystemSettingKeyEnum::WHATSAPP_TEMPLATE_AUTH_LANGUAGE => [
                'value' => ['nullable', 'string', 'max:16'],
            ],
            SystemSettingKeyEnum::STREAM_DEFAULT_PROVIDER => [
                'value' => ['required', 'string', 'in:youtube'],
            ],
            SystemSettingKeyEnum::STREAM_YOUTUBE_CLIENT_ID => [
                'value' => ['nullable', 'string', 'max:256'],
            ],
            SystemSettingKeyEnum::STREAM_YOUTUBE_CLIENT_SECRET => [
                'value' => ['nullable', 'string', 'max:512'],
            ],
            SystemSettingKeyEnum::STREAM_YOUTUBE_REFRESH_TOKEN => [
                'value' => ['nullable', 'string', 'max:2048'],
            ],
            SystemSettingKeyEnum::STREAM_YOUTUBE_CHANNEL_ID => [
                'value' => ['nullable', 'string', 'max:64', 'regex:/^UC[A-Za-z0-9_-]{22}$/'],
            ],
            SystemSettingKeyEnum::STREAM_YOUTUBE_DEFAULT_PRIVACY => [
                'value' => ['nullable', 'string', Rule::in(['public', 'unlisted'])],
            ],
            SystemSettingKeyEnum::STREAM_IDLE_END_GRACE_MINUTES => [
                'value' => ['required', 'integer', 'min:1', 'max:1440'],
            ],
            SystemSettingKeyEnum::STREAM_CONCURRENT_BROADCAST_ALERT_THRESHOLD => [
                'value' => ['required', 'integer', 'min:1', 'max:100'],
            ],
            SystemSettingKeyEnum::STREAM_DAILY_YOUTUBE_QUOTA_BUDGET => [
                'value' => ['required', 'integer', 'min:1', 'max:10000000'],
            ],
            SystemSettingKeyEnum::STREAM_QUOTA_ALERT_THRESHOLD_PERCENT => [
                'value' => ['required', 'integer', 'min:1', 'max:100'],
            ],
            SystemSettingKeyEnum::LIVE_CHAT_ENABLED => [
                'value' => ['required', 'integer', 'in:0,1'],
            ],
            SystemSettingKeyEnum::LIVE_CHAT_MIN_INTERVAL_SEC => [
                'value' => ['required', 'integer', 'min:1', 'max:60'],
            ],
            SystemSettingKeyEnum::LIVE_CHAT_BURST_MAX => [
                'value' => ['required', 'integer', 'min:1', 'max:200'],
            ],
            SystemSettingKeyEnum::LIVE_CHAT_BURST_WINDOW_SEC => [
                'value' => ['required', 'integer', 'min:60', 'max:3600'],
            ],
            SystemSettingKeyEnum::LIVE_CHAT_BODY_MAX => [
                'value' => ['required', 'integer', 'min:50', 'max:500'],
            ],
            SystemSettingKeyEnum::PUSH_ENABLED => [
                'value' => ['required', 'integer', 'in:0,1'],
            ],
            SystemSettingKeyEnum::PUSH_PROVIDER => [
                'value' => ['required', 'string', 'in:fcm'],
            ],
            SystemSettingKeyEnum::PUSH_FCM_PROJECT_ID => [
                'value' => ['nullable', 'string', 'max:128'],
            ],
            SystemSettingKeyEnum::PUSH_FCM_SERVICE_ACCOUNT_JSON => [
                'value' => ['nullable', 'string', 'max:8192'],
            ],
            SystemSettingKeyEnum::REELS_MAX_DURATION_SECONDS,
            SystemSettingKeyEnum::REELS_MIN_DURATION_SECONDS => [
                'value' => ['required', 'integer', 'min:0', 'max:3600'],
            ],
            SystemSettingKeyEnum::REELS_MAX_UPLOAD_MB => [
                'value' => ['required', 'integer', 'min:0', 'max:2048'],
            ],
            SystemSettingKeyEnum::REELS_HLS_SEGMENT_SECONDS => [
                'value' => ['required', 'integer', 'min:2', 'max:4'],
            ],
            SystemSettingKeyEnum::REELS_VIEW_MIN_WATCHED_MS => [
                'value' => ['required', 'integer', 'min:0', 'max:600000'],
            ],
            SystemSettingKeyEnum::REELS_VIEW_MIN_COMPLETION_RATE_PERCENT => [
                'value' => ['required', 'integer', 'min:0', 'max:100'],
            ],
            SystemSettingKeyEnum::REELS_VIEW_ALLOW_ANONYMOUS,
            SystemSettingKeyEnum::REELS_VIEW_REDIS_BUFFER,
            SystemSettingKeyEnum::REELS_AUTO_ENGAGEMENT_ENABLED => [
                'value' => ['required', 'integer', 'in:0,1'],
            ],
            SystemSettingKeyEnum::REELS_MULTIPART_PART_SIZE_MB => [
                'value' => ['required', 'integer', 'min:1', 'max:100'],
            ],
            SystemSettingKeyEnum::REELS_MULTIPART_MAX_PARTS => [
                'value' => ['required', 'integer', 'min:0', 'max:10000'],
            ],
            SystemSettingKeyEnum::REELS_ENGAGEMENT_PER_DAY => [
                'value' => ['required', 'integer', 'min:0', 'max:200'],
            ],
            SystemSettingKeyEnum::REELS_SIMPLE_POST_LIKES_PER_DAY => [
                'value' => ['required', 'integer', 'min:0', 'max:50'],
            ],
        };
    }

    public static function prepareForValidation(FormRequest $request, ?SystemSettingKeyEnum $key): void
    {
        if ($key === null) {
            return;
        }

        if ($key === SystemSettingKeyEnum::DEFAULT_CURRENCY && $request->has('value') && is_string($request->input('value'))) {
            $request->merge(['value' => strtoupper(trim($request->input('value')))]);
        }

        if ($key === SystemSettingKeyEnum::GRAPHICS_DEFAULT_TTL_SECONDS && $request->input('value') === '') {
            $request->merge(['value' => null]);
        }

        if (self::meta($key)['nullable_string']) {
            $value = $request->input('value');
            if ($value === '' || (is_string($value) && trim($value) === '')) {
                $request->merge(['value' => null]);
            }
        }

        if ($key === SystemSettingKeyEnum::CDN_PUBLIC_BASE_URL && is_string($request->input('value'))) {
            $normalized = MediaCdn::normalizeBaseUrl($request->input('value'));
            $request->merge(['value' => $normalized]);
        }
    }

    public static function afterValidation(Validator $validator, ?SystemSettingKeyEnum $key, mixed $raw): void
    {
        if ($key === null) {
            return;
        }

        if ($key === SystemSettingKeyEnum::NOTIFICATION_ADMIN_EMAILS && is_string($raw) && trim($raw) !== '') {
            foreach (preg_split('/\s*,\s*/', $raw, -1, PREG_SPLIT_NO_EMPTY) as $email) {
                $email = trim($email);
                if ($email === '') {
                    continue;
                }
                if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $validator->errors()->add('value', 'Invalid Email Address: '.$email);
                }
            }
        }

        if ($key === SystemSettingKeyEnum::TEST_OTP_PHONES && is_string($raw) && trim($raw) !== '') {
            foreach (preg_split('/\s*,\s*/', $raw, -1, PREG_SPLIT_NO_EMPTY) as $num) {
                $digits = preg_replace('/\D/', '', $num);
                if (strlen($digits) < 8 || strlen($digits) > 15) {
                    $validator->errors()->add('value', 'Invalid Test Phone (Use 8–15 Digits, Optional +): '.trim($num));
                }
            }
        }

        if ($key === SystemSettingKeyEnum::SMS_OTP_MESSAGE && is_string($raw) && trim($raw) !== '') {
            if (! str_contains($raw, ':code')) {
                $validator->errors()->add('value', 'The OTP Message Must Contain the :code Placeholder.');
            }
        }

        if ($key === SystemSettingKeyEnum::PUSH_FCM_SERVICE_ACCOUNT_JSON && is_string($raw) && trim($raw) !== '') {
            $decoded = json_decode($raw, true);
            if (! is_array($decoded)) {
                $validator->errors()->add('value', 'The FCM Service Account JSON Must Be Valid JSON.');
            } elseif (! isset($decoded['project_id'], $decoded['private_key'], $decoded['client_email'])) {
                $validator->errors()->add('value', 'The FCM Service Account JSON Must Include project_id, private_key, and client_email.');
            }
        }
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private static function definitions(): array
    {
        static $cache;

        return $cache ??= [
            SystemSettingKeyEnum::DEFAULT_CURRENCY->value => [
                'group' => SystemSettingGroupEnum::REGIONAL,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'Default Currency',
                'description' => 'Default ISO 4217 Currency Code.',
                'settings_class' => GeneralSettings::class,
                'property' => 'currency',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::TIMEZONE->value => [
                'group' => SystemSettingGroupEnum::REGIONAL,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'Timezone',
                'description' => 'PHP Timezone for Scheduling and Display.',
                'settings_class' => GeneralSettings::class,
                'property' => 'timezone',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::IOS_APP_STORE_URL->value => [
                'group' => SystemSettingGroupEnum::MOBILE_APP,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'iOS App Store Link',
                'description' => 'App Store Listing URL.',
                'settings_class' => AppStoreSettings::class,
                'property' => 'iosStoreUrl',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::ANDROID_PLAY_STORE_URL->value => [
                'group' => SystemSettingGroupEnum::MOBILE_APP,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'Google Play Link',
                'description' => 'Google Play Listing URL.',
                'settings_class' => AppStoreSettings::class,
                'property' => 'androidStoreUrl',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::IOS_APP_STORE_VERSION->value => [
                'group' => SystemSettingGroupEnum::MOBILE_APP,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'iOS App Store Version',
                'description' => 'Version of the iOS app as published.',
                'settings_class' => AppStoreSettings::class,
                'property' => 'iosVersion',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::ANDROID_PLAY_STORE_VERSION->value => [
                'group' => SystemSettingGroupEnum::MOBILE_APP,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'Google Play Store Version',
                'description' => 'Version of the Android app as published.',
                'settings_class' => AppStoreSettings::class,
                'property' => 'androidVersion',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::SUPPORT_EMAIL->value => [
                'group' => SystemSettingGroupEnum::CONTACT,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'Support Email',
                'description' => 'Public Support Email Shown in the App.',
                'settings_class' => ContactSettings::class,
                'property' => 'supportEmail',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::SUPPORT_PHONE->value => [
                'group' => SystemSettingGroupEnum::CONTACT,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'Support Phone',
                'description' => 'Public Support Phone Shown in the App.',
                'settings_class' => ContactSettings::class,
                'property' => 'supportPhone',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::PUBLIC_WEBSITE_URL->value => [
                'group' => SystemSettingGroupEnum::MARKETING,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'Public Website URL',
                'description' => 'Marketing or Corporate Website URL.',
                'settings_class' => ContactSettings::class,
                'property' => 'publicWebsiteUrl',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::CDN_PUBLIC_BASE_URL->value => [
                'group' => SystemSettingGroupEnum::MEDIA_CDN,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'CDN Public Base URL',
                'description' => 'Cloudflare hostname for media and static /app assets (e.g. https://cdn.tapeya.com). Empty uses AWS_URL.',
                'settings_class' => MediaCdnSettings::class,
                'property' => 'cdnPublicBaseUrl',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::NOTIFICATION_ADMIN_EMAILS->value => [
                'group' => SystemSettingGroupEnum::ADMIN_MAIL,
                'type' => SystemSettingTypeEnum::TEXT,
                'label' => 'Notification Admin Emails',
                'description' => 'Comma-Separated Admin Emails for Order and System Mail.',
                'settings_class' => AdminNotificationSettings::class,
                'property' => 'adminEmails',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::GRAPHICS_FRONTEND_URL->value => [
                'group' => SystemSettingGroupEnum::GRAPHIC_CONTROLLER,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'Graphics Frontend URL',
                'description' => 'Graphics app origin (e.g. https://graphics.tapeya.com).',
                'settings_class' => GraphicsSettings::class,
                'property' => 'frontendUrl',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::GRAPHICS_DEFAULT_TTL_SECONDS->value => [
                'group' => SystemSettingGroupEnum::GRAPHIC_CONTROLLER,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Graphics Signed URL TTL (Seconds)',
                'description' => 'Signed graphics URL lifetime in seconds.',
                'settings_class' => GraphicsSettings::class,
                'property' => 'defaultTtlSeconds',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::GRAPHICS_SIGNING_SECRET->value => [
                'group' => SystemSettingGroupEnum::GRAPHIC_CONTROLLER,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'Graphics Signing Secret',
                'description' => 'HMAC secret for signed graphics URLs.',
                'settings_class' => GraphicsSettings::class,
                'property' => 'signingSecret',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::TEST_OTP_PHONES->value => [
                'group' => SystemSettingGroupEnum::OTP,
                'type' => SystemSettingTypeEnum::TEXT,
                'label' => 'Test OTP Phone Numbers',
                'description' => 'Comma-Separated Test Phones (E.164). OTP in JSON Only, No SMS.',
                'settings_class' => OtpSettings::class,
                'property' => 'testPhoneNumbers',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::SMS_DRIVER->value => [
                'group' => SystemSettingGroupEnum::SMS,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'SMS Driver',
                'description' => 'log, null, veevotech, or whatsapp.',
                'settings_class' => SmsSettings::class,
                'property' => 'driver',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::SMS_OTP_MESSAGE->value => [
                'group' => SystemSettingGroupEnum::SMS,
                'type' => SystemSettingTypeEnum::TEXT,
                'label' => 'SMS OTP Message Template',
                'description' => 'OTP SMS Body; Must Include :code.',
                'settings_class' => SmsSettings::class,
                'property' => 'otpMessage',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::SMS_FROM->value => [
                'group' => SystemSettingGroupEnum::SMS_VEEVOTECH,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'SMS Sender Name',
                'description' => 'VeevoTech Sender Label on Outbound SMS.',
                'settings_class' => VeevoTechSmsSettings::class,
                'property' => 'from',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::SMS_VEEVOTECH_API_URL->value => [
                'group' => SystemSettingGroupEnum::SMS_VEEVOTECH,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'VeevoTech API URL',
                'description' => 'POST Endpoint Provided by VeevoTech.',
                'settings_class' => VeevoTechSmsSettings::class,
                'property' => 'veevotechApiUrl',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::SMS_VEEVOTECH_API_KEY->value => [
                'group' => SystemSettingGroupEnum::SMS_VEEVOTECH,
                'type' => SystemSettingTypeEnum::TEXT,
                'label' => 'VeevoTech API Key (Hash)',
                'description' => 'Account Hash Sent as `hash` in the JSON Body (Stored Encrypted).',
                'settings_class' => VeevoTechSmsSettings::class,
                'property' => 'veevotechApiKey',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::WHATSAPP_PHONE_NUMBER_ID->value => [
                'group' => SystemSettingGroupEnum::WHATSAPP,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'WhatsApp Phone Number ID',
                'description' => 'Meta Phone Number ID.',
                'settings_class' => WhatsAppSettings::class,
                'property' => 'phoneNumberId',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::WHATSAPP_ACCESS_TOKEN->value => [
                'group' => SystemSettingGroupEnum::WHATSAPP,
                'type' => SystemSettingTypeEnum::TEXT,
                'label' => 'WhatsApp Access Token',
                'description' => 'Meta Access Token.',
                'settings_class' => WhatsAppSettings::class,
                'property' => 'accessToken',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::WHATSAPP_API_VERSION->value => [
                'group' => SystemSettingGroupEnum::WHATSAPP,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'WhatsApp API Version',
                'description' => 'Graph API Version.',
                'settings_class' => WhatsAppSettings::class,
                'property' => 'apiVersion',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::WHATSAPP_API_BASE_URL->value => [
                'group' => SystemSettingGroupEnum::WHATSAPP,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'WhatsApp API Base URL',
                'description' => 'Graph API Base URL.',
                'settings_class' => WhatsAppSettings::class,
                'property' => 'baseUrl',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::WHATSAPP_TEMPLATE_AUTH_NAME->value => [
                'group' => SystemSettingGroupEnum::WHATSAPP,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'WhatsApp Template: Auth Name',
                'description' => 'OTP Template Name.',
                'settings_class' => WhatsAppSettings::class,
                'property' => 'authTemplateName',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::WHATSAPP_TEMPLATE_AUTH_LANGUAGE->value => [
                'group' => SystemSettingGroupEnum::WHATSAPP,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'WhatsApp Template: Auth Language',
                'description' => 'OTP Template Locale.',
                'settings_class' => WhatsAppSettings::class,
                'property' => 'authTemplateLanguage',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::STREAM_DEFAULT_PROVIDER->value => [
                'group' => SystemSettingGroupEnum::STREAMING,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'Default Stream Provider',
                'description' => 'Active streaming provider. Currently: youtube.',
                'settings_class' => StreamingSettings::class,
                'property' => 'defaultProvider',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::STREAM_YOUTUBE_CLIENT_ID->value => [
                'group' => SystemSettingGroupEnum::STREAMING,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'YouTube OAuth Client ID',
                'description' => 'Google Cloud Console OAuth2 Client ID.',
                'settings_class' => StreamingSettings::class,
                'property' => 'youtubeClientId',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::STREAM_YOUTUBE_CLIENT_SECRET->value => [
                'group' => SystemSettingGroupEnum::STREAMING,
                'type' => SystemSettingTypeEnum::TEXT,
                'label' => 'YouTube OAuth Client Secret',
                'description' => 'Google Cloud Console OAuth2 Client Secret (stored encrypted).',
                'settings_class' => StreamingSettings::class,
                'property' => 'youtubeClientSecret',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::STREAM_YOUTUBE_REFRESH_TOKEN->value => [
                'group' => SystemSettingGroupEnum::STREAMING,
                'type' => SystemSettingTypeEnum::TEXT,
                'label' => 'YouTube Platform Refresh Token',
                'description' => 'Generated via: php artisan youtube:authorize (stored encrypted).',
                'settings_class' => StreamingSettings::class,
                'property' => 'youtubeRefreshToken',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::STREAM_YOUTUBE_CHANNEL_ID->value => [
                'group' => SystemSettingGroupEnum::STREAMING,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'YouTube Channel ID',
                'description' => 'UCxxxxxxxxxxxx — the Tapeya platform channel.',
                'settings_class' => StreamingSettings::class,
                'property' => 'youtubeChannelId',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::STREAM_YOUTUBE_DEFAULT_PRIVACY->value => [
                'group' => SystemSettingGroupEnum::STREAMING,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'YouTube Default Broadcast Privacy',
                'description' => 'Default for new broadcasts: public or unlisted.',
                'settings_class' => StreamingSettings::class,
                'property' => 'youtubeDefaultPrivacy',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::STREAM_IDLE_END_GRACE_MINUTES->value => [
                'group' => SystemSettingGroupEnum::STREAMING,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Idle Stream Auto-End Grace',
                'description' => 'Minutes idle before auto-end.',
                'settings_class' => StreamingSettings::class,
                'property' => 'idleEndGraceMinutes',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::STREAM_CONCURRENT_BROADCAST_ALERT_THRESHOLD->value => [
                'group' => SystemSettingGroupEnum::STREAMING,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Concurrent Broadcast Alert Threshold',
                'description' => 'Alert staff when starting/live YouTube streams reach this count (admin + Go Live share one channel). Default 3.',
                'settings_class' => StreamingSettings::class,
                'property' => 'concurrentBroadcastAlertThreshold',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::STREAM_DAILY_YOUTUBE_QUOTA_BUDGET->value => [
                'group' => SystemSettingGroupEnum::STREAMING,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Daily YouTube Quota Budget',
                'description' => 'Daily YouTube Data API v3 quota units (Google default is 10,000). Used for ops alerts only.',
                'settings_class' => StreamingSettings::class,
                'property' => 'dailyYoutubeQuotaBudget',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::STREAM_QUOTA_ALERT_THRESHOLD_PERCENT->value => [
                'group' => SystemSettingGroupEnum::STREAMING,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'YouTube Quota Alert Threshold %',
                'description' => 'Alert staff once today’s tracked API usage reaches this percent of the daily budget. Default 80.',
                'settings_class' => StreamingSettings::class,
                'property' => 'quotaAlertThresholdPercent',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::LIVE_CHAT_ENABLED->value => [
                'group' => SystemSettingGroupEnum::LIVE_CHAT,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Live Chat Enabled',
                'description' => '1 = chat on, 0 = kill switch (POST and UI disabled).',
                'settings_class' => LiveChatSettings::class,
                'property' => 'enabled',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::LIVE_CHAT_MIN_INTERVAL_SEC->value => [
                'group' => SystemSettingGroupEnum::LIVE_CHAT,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Min Interval (seconds)',
                'description' => 'Minimum seconds between sends per user per match.',
                'settings_class' => LiveChatSettings::class,
                'property' => 'minIntervalSec',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::LIVE_CHAT_BURST_MAX->value => [
                'group' => SystemSettingGroupEnum::LIVE_CHAT,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Burst Max',
                'description' => 'Max messages per user per burst window.',
                'settings_class' => LiveChatSettings::class,
                'property' => 'burstMax',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::LIVE_CHAT_BURST_WINDOW_SEC->value => [
                'group' => SystemSettingGroupEnum::LIVE_CHAT,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Burst Window (seconds)',
                'description' => 'Duration of the burst rate-limit window.',
                'settings_class' => LiveChatSettings::class,
                'property' => 'burstWindowSec',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::LIVE_CHAT_BODY_MAX->value => [
                'group' => SystemSettingGroupEnum::LIVE_CHAT,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Body Max (characters)',
                'description' => 'Maximum comment length in characters.',
                'settings_class' => LiveChatSettings::class,
                'property' => 'bodyMax',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::PUSH_ENABLED->value => [
                'group' => SystemSettingGroupEnum::PUSH_NOTIFICATIONS,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Push Notifications Enabled',
                'description' => '1 = push on, 0 = kill switch (audit log only, no FCM delivery).',
                'settings_class' => PushSettings::class,
                'property' => 'enabled',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::PUSH_PROVIDER->value => [
                'group' => SystemSettingGroupEnum::PUSH_NOTIFICATIONS,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'Push Provider',
                'description' => 'Active push provider. Currently: fcm.',
                'settings_class' => PushSettings::class,
                'property' => 'provider',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::PUSH_FCM_PROJECT_ID->value => [
                'group' => SystemSettingGroupEnum::PUSH_NOTIFICATIONS,
                'type' => SystemSettingTypeEnum::STRING,
                'label' => 'FCM Project ID',
                'description' => 'Firebase project ID for FCM HTTP v1 API.',
                'settings_class' => PushSettings::class,
                'property' => 'fcmProjectId',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::PUSH_FCM_SERVICE_ACCOUNT_JSON->value => [
                'group' => SystemSettingGroupEnum::PUSH_NOTIFICATIONS,
                'type' => SystemSettingTypeEnum::TEXT,
                'label' => 'FCM Service Account JSON',
                'description' => 'Full Firebase service account JSON key (stored encrypted).',
                'settings_class' => PushSettings::class,
                'property' => 'fcmServiceAccountJson',
                'nullable_string' => true,
            ],
            SystemSettingKeyEnum::REELS_MAX_DURATION_SECONDS->value => [
                'group' => SystemSettingGroupEnum::REELS,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Max Duration (seconds)',
                'description' => 'Maximum reel length in seconds. 0 = no app limit.',
                'settings_class' => PostsSettings::class,
                'property' => 'maxDurationSeconds',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::REELS_MIN_DURATION_SECONDS->value => [
                'group' => SystemSettingGroupEnum::REELS,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Min Duration (seconds)',
                'description' => 'Minimum reel length in seconds. 0 = no app limit.',
                'settings_class' => PostsSettings::class,
                'property' => 'minDurationSeconds',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::REELS_MAX_UPLOAD_MB->value => [
                'group' => SystemSettingGroupEnum::REELS,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Max Upload (MB)',
                'description' => 'Maximum original file size in megabytes. 0 = no app limit.',
                'settings_class' => PostsSettings::class,
                'property' => 'maxUploadMb',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::REELS_HLS_SEGMENT_SECONDS->value => [
                'group' => SystemSettingGroupEnum::REELS,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'HLS Segment Seconds',
                'description' => 'HLS segment length in seconds (clamped 2–4). Default 2 for faster ABR on short reels.',
                'settings_class' => PostsSettings::class,
                'property' => 'hlsSegmentSeconds',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::REELS_VIEW_MIN_WATCHED_MS->value => [
                'group' => SystemSettingGroupEnum::REELS,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'View Min Watched (ms)',
                'description' => 'Minimum watched milliseconds before a view can count.',
                'settings_class' => PostsSettings::class,
                'property' => 'viewMinWatchedMs',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::REELS_VIEW_MIN_COMPLETION_RATE_PERCENT->value => [
                'group' => SystemSettingGroupEnum::REELS,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'View Min Completion %',
                'description' => 'Minimum watch completion percent (0–100) to count a view. Default 25.',
                'settings_class' => PostsSettings::class,
                'property' => 'viewMinCompletionRatePercent',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::REELS_VIEW_ALLOW_ANONYMOUS->value => [
                'group' => SystemSettingGroupEnum::REELS,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Allow Anonymous Views',
                'description' => '1 = count views without auth, 0 = authenticated only.',
                'settings_class' => PostsSettings::class,
                'property' => 'viewAllowAnonymous',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::REELS_VIEW_REDIS_BUFFER->value => [
                'group' => SystemSettingGroupEnum::REELS,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Redis View Buffer',
                'description' => 'Deprecated: view counts always write to MySQL immediately. Leftover Redis keys can still be drained with reels:flush-view-counters.',
                'settings_class' => PostsSettings::class,
                'property' => 'viewRedisBuffer',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::REELS_MULTIPART_PART_SIZE_MB->value => [
                'group' => SystemSettingGroupEnum::REELS,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Multipart Part Size (MB)',
                'description' => 'Chunk size for reel original uploads in megabytes (e.g. 1 = 1 MB).',
                'settings_class' => PostsSettings::class,
                'property' => 'multipartPartSizeMb',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::REELS_MULTIPART_MAX_PARTS->value => [
                'group' => SystemSettingGroupEnum::REELS,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Multipart Max Parts',
                'description' => 'Maximum number of upload parts. 0 = no app limit.',
                'settings_class' => PostsSettings::class,
                'property' => 'multipartMaxParts',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::REELS_AUTO_ENGAGEMENT_ENABLED->value => [
                'group' => SystemSettingGroupEnum::REELS,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Auto Engagement Enabled',
                'description' => '1 = drip likes/views from random active users. 0 = off.',
                'settings_class' => PostsSettings::class,
                'property' => 'autoEngagementEnabled',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::REELS_ENGAGEMENT_PER_DAY->value => [
                'group' => SystemSettingGroupEnum::REELS,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Reels Likes And Views Target',
                'description' => 'Target likes_count and views_count per reel (video). 0–200. Each like also counts as a view.',
                'settings_class' => PostsSettings::class,
                'property' => 'reelsEngagementPerDay',
                'nullable_string' => false,
            ],
            SystemSettingKeyEnum::REELS_SIMPLE_POST_LIKES_PER_DAY->value => [
                'group' => SystemSettingGroupEnum::REELS,
                'type' => SystemSettingTypeEnum::INTEGER,
                'label' => 'Simple Post Likes Target',
                'description' => 'Target likes_count per text/image/repost. 0–50. Views are not boosted.',
                'settings_class' => PostsSettings::class,
                'property' => 'simplePostLikesPerDay',
                'nullable_string' => false,
            ],
        ];
    }

    /** @return list<string> */
    private static function splitCommaEmails(?string $raw): array
    {
        if ($raw === null || trim($raw) === '') {
            return [];
        }

        return array_values(array_filter(
            array_map('trim', preg_split('/\s*,\s*/', $raw, -1, PREG_SPLIT_NO_EMPTY))
        ));
    }

    /** @return list<string> */
    private static function splitCommaPhones(?string $raw): array
    {
        if ($raw === null || trim($raw) === '') {
            return [];
        }

        return array_values(array_unique(array_filter(array_map(
            static function (string $p): ?string {
                $p = trim($p);

                return $p === '' ? null : '+'.preg_replace('/\D/', '', $p);
            },
            preg_split('/\s*,\s*/', $raw, -1, PREG_SPLIT_NO_EMPTY)
        ))));
    }
}
