<?php

namespace App\Services\Payments\NowPayments;

use Illuminate\Support\Str;

class NowPaymentsUtils extends BaseNowPaymentService
{
    public static function getBaseUrl(): string
    {
        $baseUrl = config('nowpayments.env') === 'sandbox'
            ? config('nowpayments.sandboxUrl')
            : config('nowpayments.liveUrl');

        $baseUrl = self::cleanBaseUrl($baseUrl);

        return $baseUrl;
    }

    private static function cleanBaseUrl(string $baseUrl): string
    {
        return Str::of($baseUrl)->rtrim('/')->value();
    }

    private static function cleanEndpoint(string $endpoint): string
    {
        return Str::of($endpoint)->ltrim('/')->value();
    }

    public static function getIconUrl(string $iconUrl): string
    {
        $iconUrl = self::cleanEndpoint($iconUrl);

        return "https://nowpayments.io/{$iconUrl}";
    }

    public static function resolveUrl(string $endpoint): string
    {
        $baseUrl = self::getBaseUrl();
        $endpoint = self::cleanEndpoint($endpoint);

        return "{$baseUrl}/{$endpoint}";
    }
}
