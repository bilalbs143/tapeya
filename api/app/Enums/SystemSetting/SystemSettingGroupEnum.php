<?php

namespace App\Enums\SystemSetting;

use App\Enums\BaseEnumTrait;

enum SystemSettingGroupEnum: string
{
    use BaseEnumTrait;

    /** Currency, timezone — platform defaults for display and scheduling. */
    case REGIONAL = 'regional';

    /** App Store / Play Store listing URLs. */
    case MOBILE_APP = 'mobile_app';

    /** Public support channels. */
    case CONTACT = 'contact';

    /** Public marketing / corporate site (distinct from one-to-one support). */
    case MARKETING = 'marketing';

    /** Internal admin inboxes (order alerts, system mail). */
    case ADMIN_MAIL = 'admin_mail';

    /** Live graphics / OBS browser source: overlay URL, signing, TTL. */
    case GRAPHIC_CONTROLLER = 'graphic_controller';

    /** OTP verification behaviour (e.g. QA test numbers). */
    case OTP = 'otp';

    /** SMS channel configuration (driver, OTP template). */
    case SMS = 'sms';

    /** VeevoTech SMS gateway (sender, endpoint, API hash). */
    case SMS_VEEVOTECH = 'sms_veevotech';

    /** WhatsApp Business channel configuration. */
    case WHATSAPP = 'whatsapp';

    /** Live streaming provider configuration. */
    case STREAMING = 'streaming';

    /** Live match chat (rate limits, kill switch). */
    case LIVE_CHAT = 'live_chat';

    public function label(): string
    {
        return match ($this) {
            self::REGIONAL => 'Regional & Locale',
            self::MOBILE_APP => 'Mobile App (Stores)',
            self::CONTACT => 'Contact & Support',
            self::MARKETING => 'Marketing',
            self::ADMIN_MAIL => 'Admin Email',
            self::GRAPHIC_CONTROLLER => 'Graphic Controller',
            self::OTP => 'OTP & Verification',
            self::SMS => 'SMS',
            self::SMS_VEEVOTECH => 'SMS (VeevoTech)',
            self::WHATSAPP => 'WhatsApp',
            self::STREAMING => 'Live Streaming',
            self::LIVE_CHAT => 'Live Match Chat',
        };
    }
}
