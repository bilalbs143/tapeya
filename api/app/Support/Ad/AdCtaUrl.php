<?php

namespace App\Support\Ad;

use App\Enums\Ad\AdCtaTypeEnum;

final class AdCtaUrl
{
    public static function isValid(string $type, string $value): bool
    {
        $value = trim($value);
        if ($value === '') {
            return false;
        }

        return match ($type) {
            AdCtaTypeEnum::Url->value, 'url' => (bool) filter_var($value, FILTER_VALIDATE_URL)
                && str_starts_with(strtolower($value), 'http'),
            AdCtaTypeEnum::DeepLink->value, 'deep_link' => true,
            AdCtaTypeEnum::Whatsapp->value, 'whatsapp' => self::whatsappDigits($value) !== null,
            default => false,
        };
    }

    public static function validationMessage(string $type): string
    {
        return match ($type) {
            AdCtaTypeEnum::Url->value, 'url' => 'CTA URL Must Be A Valid HTTP(S) URL.',
            AdCtaTypeEnum::Whatsapp->value, 'whatsapp' => 'CTA Must Be A WhatsApp Number Or wa.me Link.',
            default => 'CTA Value Is Invalid.',
        };
    }

    /** Digits only for wa.me, or null if unusable. */
    public static function whatsappDigits(string $value): ?string
    {
        $value = trim($value);
        if ($value === '') {
            return null;
        }

        if (preg_match('~(?:wa\.me/|phone=)(\d{8,15})~i', $value, $m)) {
            return $m[1];
        }

        $digits = preg_replace('/\D+/', '', $value) ?? '';
        if (strlen($digits) >= 8 && strlen($digits) <= 15) {
            return $digits;
        }

        return null;
    }
}
