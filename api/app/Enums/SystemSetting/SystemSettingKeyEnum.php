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

    case CDN_PUBLIC_BASE_URL = 'cdn_public_base_url';

    case NOTIFICATION_ADMIN_EMAILS = 'notification_admin_emails';

    case GRAPHICS_FRONTEND_URL = 'graphics_frontend_url';

    case GRAPHICS_DEFAULT_TTL_SECONDS = 'graphics_default_ttl_seconds';

    case GRAPHICS_SIGNING_SECRET = 'graphics_signing_secret';

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
    case STREAM_IDLE_END_GRACE_MINUTES = 'stream_idle_end_grace_minutes';
    case STREAM_CONCURRENT_BROADCAST_ALERT_THRESHOLD = 'stream_concurrent_broadcast_alert_threshold';
    case STREAM_DAILY_YOUTUBE_QUOTA_BUDGET = 'stream_daily_youtube_quota_budget';
    case STREAM_QUOTA_ALERT_THRESHOLD_PERCENT = 'stream_quota_alert_threshold_percent';

    case LIVE_CHAT_ENABLED = 'live_chat_enabled';
    case LIVE_CHAT_MIN_INTERVAL_SEC = 'live_chat_min_interval_sec';
    case LIVE_CHAT_BURST_MAX = 'live_chat_burst_max';
    case LIVE_CHAT_BURST_WINDOW_SEC = 'live_chat_burst_window_sec';
    case LIVE_CHAT_BODY_MAX = 'live_chat_body_max';

    case PUSH_ENABLED = 'push_enabled';
    case PUSH_PROVIDER = 'push_provider';
    case PUSH_FCM_PROJECT_ID = 'push_fcm_project_id';
    case PUSH_FCM_SERVICE_ACCOUNT_JSON = 'push_fcm_service_account_json';

    case REELS_MAX_DURATION_SECONDS = 'reels_max_duration_seconds';
    case REELS_MIN_DURATION_SECONDS = 'reels_min_duration_seconds';
    case REELS_MAX_UPLOAD_MB = 'reels_max_upload_mb';
    case REELS_HLS_SEGMENT_SECONDS = 'reels_hls_segment_seconds';
    case REELS_VIEW_MIN_WATCHED_MS = 'reels_view_min_watched_ms';
    case REELS_VIEW_MIN_COMPLETION_RATE_PERCENT = 'reels_view_min_completion_rate_percent';
    case REELS_VIEW_ALLOW_ANONYMOUS = 'reels_view_allow_anonymous';
    case REELS_VIEW_REDIS_BUFFER = 'reels_view_redis_buffer';
    case REELS_MULTIPART_PART_SIZE_MB = 'reels_multipart_part_size_mb';
    case REELS_MULTIPART_MAX_PARTS = 'reels_multipart_max_parts';
    case REELS_AUTO_ENGAGEMENT_ENABLED = 'reels_auto_engagement_enabled';
    case REELS_ENGAGEMENT_PER_DAY = 'reels_engagement_per_day';
    case REELS_SIMPLE_POST_LIKES_PER_DAY = 'reels_simple_post_likes_per_day';

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
            self::CDN_PUBLIC_BASE_URL,
            self::LIVE_CHAT_ENABLED,
            self::REELS_MAX_DURATION_SECONDS,
            self::REELS_MIN_DURATION_SECONDS,
            self::REELS_MAX_UPLOAD_MB,
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
