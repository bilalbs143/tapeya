<?php

namespace App\Enums\SystemSetting;

use App\Enums\BaseEnumTrait;
use App\Settings\SystemSettingRegistry;

/**
 * System setting keys (API path segment and Spatie persistence). Metadata and bindings live in
 * {@see SystemSettingRegistry}.
 */
enum SystemSettingKeyEnum: string
{
    use BaseEnumTrait;

    case DEFAULT_CURRENCY = 'default_currency';

    case TIMEZONE = 'timezone';

    case IOS_APP_STORE_URL = 'ios_app_store_url';
    case ANDROID_PLAY_STORE_URL = 'android_play_store_url';

    case IOS_APP_STORE_VERSION = 'ios_app_store_version';

    case ANDROID_PLAY_STORE_VERSION = 'android_play_store_version';

    case SUPPORT_EMAIL = 'support_email';

    case SUPPORT_PHONE = 'support_phone';

    case PUBLIC_WEBSITE_URL = 'public_website_url';

    case NOTIFICATION_ADMIN_EMAILS = 'notification_admin_emails';

    case OVERLAY_FRONTEND_URL = 'overlay_frontend_url';

    case OVERLAY_DEFAULT_TTL_SECONDS = 'overlay_default_ttl_seconds';

    case OVERLAY_SIGNING_SECRET = 'overlay_signing_secret';

    case TEST_OTP_PHONES = 'test_otp_phones';

    case SMS_DRIVER = 'sms_driver';
    case SMS_FROM = 'sms_from';

    case SMS_OTP_MESSAGE = 'sms_otp_message';

    case SMS_VEEVOTECH_API_URL = 'sms_veevotech_api_url';
    case SMS_VEEVOTECH_API_KEY = 'sms_veevotech_api_key';

    case WHATSAPP_PHONE_NUMBER_ID = 'whatsapp_phone_number_id';
    case WHATSAPP_ACCESS_TOKEN = 'whatsapp_access_token';
    case WHATSAPP_API_VERSION = 'whatsapp_api_version';
    case WHATSAPP_API_BASE_URL = 'whatsapp_api_base_url';
    case WHATSAPP_TEMPLATE_AUTH_NAME = 'whatsapp_template_auth_name';
    case WHATSAPP_TEMPLATE_AUTH_LANGUAGE = 'whatsapp_template_auth_language';

    case STREAM_DEFAULT_PROVIDER = 'stream_default_provider';
    case STREAM_YOUTUBE_CLIENT_ID = 'stream_youtube_client_id';
    case STREAM_YOUTUBE_CLIENT_SECRET = 'stream_youtube_client_secret';
    case STREAM_YOUTUBE_REFRESH_TOKEN = 'stream_youtube_refresh_token';
    case STREAM_YOUTUBE_CHANNEL_ID = 'stream_youtube_channel_id';
    case STREAM_YOUTUBE_DEFAULT_PRIVACY = 'stream_youtube_default_privacy';

    case LIVE_CHAT_ENABLED = 'live_chat_enabled';
    case LIVE_CHAT_MIN_INTERVAL_SEC = 'live_chat_min_interval_sec';
    case LIVE_CHAT_BURST_MAX = 'live_chat_burst_max';
    case LIVE_CHAT_BURST_WINDOW_SEC = 'live_chat_burst_window_sec';
    case LIVE_CHAT_BODY_MAX = 'live_chat_body_max';

    case PUSH_ENABLED = 'push_enabled';
    case PUSH_PROVIDER = 'push_provider';
    case PUSH_FCM_PROJECT_ID = 'push_fcm_project_id';
    case PUSH_FCM_SERVICE_ACCOUNT_JSON = 'push_fcm_service_account_json';

    public function group(): SystemSettingGroupEnum
    {
        return SystemSettingRegistry::group($this);
    }

    public function type(): SystemSettingTypeEnum
    {
        return SystemSettingRegistry::type($this);
    }

    public function label(): string
    {
        return SystemSettingRegistry::label($this);
    }

    public function description(): string
    {
        return SystemSettingRegistry::description($this);
    }

    /**
     * @return list<self>
     */
    public static function publicKeys(): array
    {
        return [
            self::DEFAULT_CURRENCY,
            self::TIMEZONE,
            self::IOS_APP_STORE_URL,
            self::ANDROID_PLAY_STORE_URL,
            self::IOS_APP_STORE_VERSION,
            self::ANDROID_PLAY_STORE_VERSION,
            self::SUPPORT_EMAIL,
            self::SUPPORT_PHONE,
            self::PUBLIC_WEBSITE_URL,
            self::LIVE_CHAT_ENABLED,
        ];
    }

    public function read(): mixed
    {
        return SystemSettingRegistry::read($this);
    }

    public function write(mixed $value): void
    {
        SystemSettingRegistry::write($this, $value);
    }

    public function serialize(mixed $raw): mixed
    {
        return SystemSettingRegistry::serialize($this, $raw);
    }

    public function deserialize(mixed $apiValue): mixed
    {
        return SystemSettingRegistry::deserialize($this, $apiValue);
    }
}
