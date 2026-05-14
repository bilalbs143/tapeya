<?php

namespace App\Utils\Services;

use App\Exceptions\OtpSmsDeliveryException;
use App\Models\User;
use App\Services\Notifications\SmsSender;
use App\Settings\OtpSettings;
use App\Settings\SmsSettings;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class OtpService
{
    public const CACHE_PREFIX = 'otp:';

    public function __construct(
        protected SmsSender $smsSender,
        protected OtpSettings $otpSettings,
        protected SmsSettings $smsSettings,
    ) {}

    /**
     * Generate OTP, store under a normalized phone cache key, and send SMS when not in debug
     * and the phone is not listed in test_otp_phones (system setting). Debug and test phones get OTP in-app/API only.
     */
    public function sendToUser(User $user): void
    {
        $code = $this->generateCode();
        $this->store($user->phone, $code);

        if (config('app.debug') || $this->isTestOtpPhone($user->phone)) {
            return;
        }

        $template = (string) ($this->smsSettings->otpMessage ?? '');
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
        Cache::forever(self::CACHE_PREFIX.$key, $code);
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
     * Whether this phone may receive the OTP in API responses (APP_DEBUG, test_otp_phones, or SMS driver `log`).
     */
    public function shouldExposeOtpInResponse(string $phone): bool
    {
        return config('app.debug')
            || $this->isTestOtpPhone($phone)
            || $this->isSmsDriverLog();
    }

    /**
     * True when the SMS driver is `log` (OTP is included in register / request-otp JSON regardless of APP_DEBUG).
     */
    public function isSmsDriverLog(): bool
    {
        return ($this->smsSettings->driver ?? 'log') === 'log';
    }

    /**
     * Whether this phone is listed in the test_otp_phones setting (OTP returned in JSON only, no real SMS).
     */
    public function isTestOtpPhone(string $phone): bool
    {
        $normalized = self::normalizePhone($phone);
        foreach ($this->otpSettings->testPhoneNumbers as $raw) {
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
     * Return current OTP when exposure is allowed (debug, test phone, or SMS driver `log`).
     */
    public function getCurrentOtp(string $phone): ?string
    {
        if (! $this->shouldExposeOtpInResponse($phone)) {
            return null;
        }

        return Cache::get(self::CACHE_PREFIX.self::normalizePhone($phone));
    }

    /**
     * Canonical form for OTP cache keys and comparisons. Clients send E.164; only whitespace is trimmed.
     */
    public static function normalizePhone(string $phone): string
    {
        return trim($phone);
    }
}
