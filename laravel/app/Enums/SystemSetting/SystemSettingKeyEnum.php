<?php

namespace App\Enums\SystemSetting;

use App\Enums\BaseEnumTrait;
use App\Enums\Currency\CurrencyEnum;

enum SystemSettingKeyEnum: string
{
    use BaseEnumTrait;

    case APP_NAME = 'app_name';
    case APP_URL = 'app_url';
    case APP_LOGO = 'app_logo';
    case APP_FAVICON = 'app_favicon';
    case APP_THEME = 'app_theme';
    case APP_TIMEZONE = 'app_timezone';
    case BANK_INFO_FOR_QUICK_INQUIRY = 'bank_info_for_quick_inquiry';
    case DEFAULT_CURRENCY = 'default_currency';
    case REFFERAL_BONUS_PERCENTAGE = 'referral_bonus_percentage';
    case WEEKLY_LOSS_BONUS_PERCENTAGE = 'weekly_loss_bonus_percentage';
    case AUTO_APPROVAL_ENABLED = 'auto_approval_enabled';
    case LIVE_CHAT_HTML_CODE = 'live_chat_html_code';
    case TRACKING_HTML_CODE = 'tracking_html_code';

    public function getEnumClass()
    {
        return match ($this) {
            self::DEFAULT_CURRENCY => CurrencyEnum::class,
        };
    }

    public function resolveEnumValue($value)
    {
        return $this->getEnumClass()::from($value);
    }

    public function getValues()
    {
        return $this->getEnumClass()::values();
    }
}
