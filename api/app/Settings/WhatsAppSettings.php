<?php

namespace App\Settings;

use Spatie\LaravelSettings\Attributes\ShouldBeEncrypted;
use Spatie\LaravelSettings\Settings;

class WhatsAppSettings extends Settings
{
    /** Meta WhatsApp Business phone number ID. */
    public ?string $phoneNumberId;

    /** Meta Graph API access token (stored encrypted in the settings table). */
    #[ShouldBeEncrypted]
    public ?string $accessToken;

    /** Graph API version (e.g. v25.0). */
    public ?string $apiVersion;

    /** Graph API base URL (e.g. https://graph.facebook.com). */
    public ?string $baseUrl;

    /** WhatsApp template name used for OTP delivery. */
    public ?string $authTemplateName;

    /** WhatsApp template locale (e.g. en_US). */
    public ?string $authTemplateLanguage;

    public static function group(): string
    {
        return 'whatsapp';
    }
}
