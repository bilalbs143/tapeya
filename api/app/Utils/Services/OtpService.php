<?php

namespace App\Utils\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class OtpService
{
    public const TTL_SECONDS = 300; // 5 minutes

    public const CACHE_PREFIX = 'otp:';

    /**
     * Generate OTP, store for phone, and send to user (SMS / log).
     */
    public function sendToUser(User $user): void
    {
        $code = $this->generateCode();
        $this->store($user->phone, $code);

        // TODO: Send SMS (Twilio, etc.). For now log.
        Log::info('OTP for user', ['user_id' => $user->id, 'phone' => $user->phone, 'code' => $code]);
    }

    public function generateCode(int $length = 6): string
    {
        $min = (int) str_pad('1', $length, '0');
        $max = (int) str_pad('9', $length, '9');

        return (string) random_int($min, $max);
    }

    public function store(string $normalizedPhone, string $code): void
    {
        Cache::put(self::CACHE_PREFIX.$normalizedPhone, $code, self::TTL_SECONDS);
    }

    public function verify(string $normalizedPhone, string $code): bool
    {
        $stored = Cache::get(self::CACHE_PREFIX.$normalizedPhone);

        if ($stored === null || $stored !== $code) {
            return false;
        }

        Cache::forget(self::CACHE_PREFIX.$normalizedPhone);

        return true;
    }

    /**
     * Return current OTP for a phone (for testing when SMS is not ready).
     * Only use when APP_DEBUG is true; do not expose in production.
     */
    public function getCurrentOtp(string $phone): ?string
    {
        return Cache::get(self::CACHE_PREFIX.self::normalizePhone($phone));
    }

    /**
     * Normalize to E.164: + followed by digits only. User supplies country code (e.g. +44, +1, +92).
     */
    public static function normalizePhone(string $phone): string
    {
        return '+'.preg_replace('/\D/', '', $phone);
    }
}
