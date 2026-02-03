<?php

namespace App\Utils\Services;

use App\Enums\SoundSettings\SoundSettingsTypeEnum;
use App\Enums\Time\PeriodEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Models\Company;
use App\Models\SoundSetting;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class Utils
{
    public static function getModelKebab($model)
    {
        return Str::kebab(Str::plural(class_basename($model)));
    }

    public static function isLocal()
    {
        return app()->environment('local');
    }

    public static function isProduction()
    {
        return app()->environment('production');
    }

    public static function calculateMoneyAgainstPoints($points)
    {
        $points = (float) $points;

        return $points;
    }

    public static function displayMoney($money, ?TransactionTypeEnum $transactionType = null)
    {
        $money = number_format($money, 0, '.', ',');

        if ($transactionType) {
            $money = $transactionType->getSymbol().$money;
        }

        return $money;
    }

    public static function calculatePercentage(float $amount, float $percentage)
    {
        return ($amount * $percentage) / 100;
    }

    public static function yesterday()
    {
        return PeriodEnum::YESTERDAY->time();
    }

    public static function configKey(Company $model): string
    {
        return $model->is_production ? 'production' : 'staging';
    }

    public static function arrayValue(array $arr, $index, $default = null)
    {
        return isset($arr[$index]) ? $arr[$index] : $default;
    }

    public static function getArrayValue(array $array, ...$indexes)
    {
        foreach ($indexes as $index) {
            $array = self::arrayValue($array, $index);
        }

        return $array;
    }

    public static function resolveMagicValue($value)
    {
        if ($value) {
            try {
                return decrypt($value);
            } catch (\Exception $e) {
                // Log::error("Error decrypting value: {$value}", ['error' => $e->getMessage()]);

                return $value;
            }
        }

        return $value;
    }

    public static function getSortedHash(array $body, string $secret, string $hashParam = 'hash'): string
    {
        ksort($body);
        $sec = '';
        $index = 0;

        $IGNORE_SELF_APPENDED_BODY_PARAMS = [];

        foreach ($body as $key => $val) {
            if ($key !== $hashParam && ! in_array($key, $IGNORE_SELF_APPENDED_BODY_PARAMS)) {
                if ($index) {
                    $sec .= '&';
                }
                $sec .= "$key=$val";
                $index += 1;
            }
        }

        return md5($sec.$secret);
    }

    public static function generateRandomToken(int $length = 10, bool $isNumber = false, bool $hash = false)
    {
        $random = '';
        if ($isNumber) {
            $random = Str::password($length, letters: false, symbols: false, spaces: false);
        } else {
            $random = Str::random($length - 2);
            $random = Str::password(2, numbers: false, symbols: false, spaces: false).$random;
        }

        $random = Str::lower($random);

        return $hash ? md5($random) : $random;
    }

    public static function calculateTimeTaken($startTime)
    {
        $endTime = microtime(true);

        return ($endTime - $startTime) * 1000;
    }

    public static function isAdmin()
    {
        return auth()->user()->isAdmin();
    }

    public static function isAgent()
    {
        return auth()->user()->isAgent();
    }

    public static function getAgentMemberIds(User $agent)
    {
        return [
            $agent->id,
            ...$agent->allMemberIds(),
        ];
    }

    public static function getAgentChildrenIds(User $agent)
    {
        return [
            $agent->id,
            ...$agent->allChildrenIds(),
        ];
    }

    public static function getMyMemberIds()
    {
        return self::getAgentMemberIds(auth()->user());
    }

    public static function getMyChildrenIds()
    {
        return self::getAgentChildrenIds(auth()->user());
    }

    public static function getSoundSetting(?SoundSettingsTypeEnum $type)
    {
        if (! $type) {
            return null;
        }

        return SoundSetting::with('sound')->where('type', $type)->first();
    }

    public static function getAdmins()
    {
        return User::active()->admin()->active()->get();
    }

    public static function isMyResource(int|string $userId)
    {
        return auth()->check() && auth()?->id() === $userId;
    }

    public static function mask(mixed $value, bool $fullMask = false)
    {
        $maxAllowed = $fullMask ? 0 : 2;

        $length = strlen($value);
        if ($length <= ($maxAllowed + 1)) {
            return Str::of($value)->mask('*', 0);
        }

        return Str::of($value)->mask('*', $maxAllowed);
    }

    public static function wrapHiddenProperty($value)
    {
        return "<span class='hidden-item'>{$value}</span>";
    }

    public static function resolveProperty(mixed $value, string $allowedPermission, bool $isOwn = false, bool $fullMask = false)
    {
        if (is_null($value) || empty($value)) {
            return $value;
        }

        if (! $isOwn && auth()->check() && auth()?->user()?->isAgent()) {
            return RolesService::can($allowedPermission) ? $value : self::wrapHiddenProperty(self::mask($value, $fullMask));
        }

        return $value;
    }

    public static function generateUniqueRefCode(): string
    {
        do {
            $refCode = 'U'.strtoupper(Str::random(5));
        } while (User::where('ref_code', $refCode)->exists());

        return $refCode;
    }

    /**
     * Get the real client IP address from various proxy headers.
     * Handles Cloudflare, AWS ELB, Nginx, HAProxy, and other proxy scenarios.
     * Returns the actual IP address (IPv4 or IPv6) from the request.
     *
     * Priority order:
     * 1. CF-Connecting-IP (Cloudflare - most reliable)
     * 2. X-Real-IP (Nginx, HAProxy, and other proxies)
     * 3. X-Forwarded-For (standard proxy header - first IP in chain)
     * 4. request()->ip() (Laravel's default, uses X-Forwarded-For if proxies are trusted)
     * 5. REMOTE_ADDR (server variable fallback)
     */
    public static function getClientIp(): ?string
    {
        $request = request();

        // Priority 1: Cloudflare's CF-Connecting-IP header (most reliable for Cloudflare)
        if ($cfIp = $request->header('CF-Connecting-IP')) {
            $ip = trim($cfIp);
            if (self::isValidIp($ip)) {
                return $ip;
            }
        }

        // Priority 2: X-Real-IP header (commonly used by Nginx, HAProxy, etc.)
        if ($realIp = $request->header('X-Real-IP')) {
            $ip = trim($realIp);
            if (self::isValidIp($ip)) {
                return $ip;
            }
        }

        // Priority 3: X-Forwarded-For header (standard proxy header)
        // Take the first IP from the chain (the original client IP)
        if ($forwardedFor = $request->header('X-Forwarded-For')) {
            $ips = explode(',', $forwardedFor);
            $firstIp = trim($ips[0]);
            if (self::isValidIp($firstIp)) {
                return $firstIp;
            }
        }

        // Priority 4: Laravel's request()->ip() (uses X-Forwarded-For if proxies are trusted)
        $laravelIp = $request->ip();
        if ($laravelIp && self::isValidIp($laravelIp)) {
            return $laravelIp;
        }

        // Priority 5: REMOTE_ADDR (server variable fallback)
        $serverIp = $_SERVER['REMOTE_ADDR'] ?? null;
        if ($serverIp && self::isValidIp($serverIp)) {
            return $serverIp;
        }

        // Try to get raw REMOTE_ADDR even if validation fails (might be a valid IP we're not detecting)
        if ($serverIp && !empty(trim($serverIp)) && $serverIp !== 'unknown') {
            return trim($serverIp);
        }

        // If we really can't find any IP, return null (database column is nullable)
        return null;
    }

    /**
     * Check if the IP address is valid (IPv4 or IPv6).
     */
    protected static function isValidIp(string $ip): bool
    {
        $ip = trim($ip);

        // Filter out invalid IPs
        if (empty($ip) || $ip === 'unknown') {
            return false;
        }

        // Validate IP format (IPv4 or IPv6)
        return filter_var($ip, FILTER_VALIDATE_IP) !== false;
    }


    /**
     * Validate that the IP address is a valid IPv4 or IPv6 address.
     * @deprecated Use getIpv4() for IPv4-only validation
     */
    protected static function validateIp(string $ip): ?string
    {
        $ip = trim($ip);

        // Filter out invalid IPs
        if (empty($ip) || $ip === 'unknown') {
            return null;
        }

        // Validate IP format (IPv4 or IPv6)
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return $ip;
        }

        // Also allow private/reserved IPs (for local development/testing)
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }

        return null;
    }
}
