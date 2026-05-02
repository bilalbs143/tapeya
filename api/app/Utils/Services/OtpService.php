<?php

namespace App\Utils\Services;

use App\Exceptions\OtpSmsDeliveryException;
use App\Models\User;
use App\Services\Notifications\SmsSender;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class OtpService
{
    public const TTL_SECONDS = 600; // 10 minutes

    public const CACHE_PREFIX = 'otp:';

    public function __construct(
        protected SmsSender $smsSender
    ) {}

    /**
     * Generate OTP, store under a normalized phone cache key, and send SMS when not in debug
     * and the phone is not listed in TEST_OTP_PHONES. Debug and test phones get OTP in-app/API only.
     */
    public function sendToUser(User $user): void
    {
        $code = $this->generateCode();
        $this->store($user->phone, $code);

        if (config('app.debug') || self::isTestOtpPhone($user->phone)) {
            return;
        }

        $template = (string) config('notifications.sms.otp_message', 'Welcome to Tapeya, your verification code is :code. Valid for 10 minutes. Do not share this code.');
        $message = str_replace(':code', $code, $template);

        try {
            $this->smsSender->send($user->phone, $message);
        } catch (Throwable $e) {
            Log::error('OTP SMS delivery failed.', [
                'user_id' => $user->id,
                'phone' => self::normalizePhone($user->phone),
                'exception' => $e::class,
                'message' => $e->getMessage(),
            ]);

            throw new OtpSmsDeliveryException(previous: $e);
        }
    }

    /**
     * Four-digit numeric OTP. Uses mixed patterns (same idea as the former 6-digit
     * generator): avoids an all-uniform look and keeps codes easy to read in SMS.
     */
    public function generateCode(): string
    {
        return match (random_int(0, 2)) {
            0 => sprintf(
                '%02d%02d',
                random_int(10, 99),
                random_int(10, 99),
            ),
            1 => str_repeat((string) random_int(1, 9), 2)
                .sprintf('%02d', random_int(10, 99)),
            2 => str_repeat((string) random_int(1, 9), 2)
                .str_repeat((string) random_int(1, 9), 2),
        };
    }

    public function store(string $phone, string $code): void
    {
        $key = self::normalizePhone($phone);
        Cache::put(self::CACHE_PREFIX.$key, $code, self::TTL_SECONDS);
    }

    public function verify(string $phone, string $code): bool
    {
        $key = self::normalizePhone($phone);
        $stored = Cache::get(self::CACHE_PREFIX.$key);

        if ($stored === null || $stored !== $code) {
            return false;
        }

        Cache::forget(self::CACHE_PREFIX.$key);

        return true;
    }

    /**
     * Whether this phone may receive the OTP in API responses (APP_DEBUG or TEST_OTP_PHONES).
     */
    public static function shouldExposeOtpInResponse(string $phone): bool
    {
        return config('app.debug') || self::isTestOtpPhone($phone);
    }

    /**
     * Phone listed in config otp.test_phone_numbers (comma-separated in TEST_OTP_PHONES).
     */
    public static function isTestOtpPhone(string $phone): bool
    {
        $normalized = self::normalizePhone($phone);
        foreach (config('otp.test_phone_numbers', []) as $raw) {
            if ($raw === '') {
                continue;
            }
            if (self::normalizePhone($raw) === $normalized) {
                return true;
            }
        }

        return false;
    }

    /**
     * Return current OTP when exposure is allowed (debug or test phone).
     */
    public function getCurrentOtp(string $phone): ?string
    {
        if (! self::shouldExposeOtpInResponse($phone)) {
            return null;
        }

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
