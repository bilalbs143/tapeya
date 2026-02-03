<?php

namespace App\Models;

use App\Observers\BlacklistedIpObserver;
use App\Utils\Services\CacheService;
use App\Utils\Services\Utils;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Spatie\QueryBuilder\AllowedFilter;

#[ObservedBy([BlacklistedIpObserver::class])]
class BlacklistedIp extends BaseModel
{
    protected $fillable = [
        'ip',
        'memo',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'restored_at' => 'datetime',
    ];

    public function scopeIp($q, $value)
    {
        $q->where('ip', 'iLike', "%$value%");
    }

    public static function getFilters()
    {
        return [
            AllowedFilter::scope('ip'),
            'memo',
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'ip',
            'memo',
            ...self::getCreatorModifierSorts(),
        ];
    }

    public static function whitelistedRoutes()
    {
        return [
            'api/v1/admin/blacklisted-ips',
            'api/v1/admin/blacklisted-ips/{blacklistedIp}',
        ];
    }

    public static function isBlacklisted(): bool
    {
        if (! Utils::isProduction()) {
            return false;
        }

        $ip = Utils::getClientIp();
        $kebab = Utils::getModelKebab(self::class);

        return CacheService::remember(
            "{$kebab}-{$ip}",
            fn () => self::whereIp($ip)->exists(),
            now()->addDay(),
            $kebab,
        );
    }
}
