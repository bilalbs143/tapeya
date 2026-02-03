<?php

namespace App\Models;

use App\Enums\WhitelistedIp\WhitelistedIpTypeEnum;
use App\Observers\WhitelistedIpObserver;
use App\Utils\Services\CacheService;
use App\Utils\Services\Utils;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Spatie\QueryBuilder\AllowedFilter;

#[ObservedBy([WhitelistedIpObserver::class])]
class WhitelistedIp extends BaseModel
{
    protected $fillable = [
        'ip',
        'memo',
        'type',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'type' => WhitelistedIpTypeEnum::class,
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
            'type',
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'ip',
            'memo',
            'type',
            ...self::getCreatorModifierSorts(),
        ];
    }

    public static function whitelistedRoutes()
    {
        return [
            'api/v1/admin/whitelisted-ips',
            'api/v1/admin/whitelisted-ips/{whitelistedIp}',
        ];
    }

    public static function isWhitelisted(WhitelistedIpTypeEnum $type = WhitelistedIpTypeEnum::ADMIN): bool
    {
        if (! Utils::isProduction()) {
            return true;
        }

        $ip = Utils::getClientIp();
        $kebab = Utils::getModelKebab(self::class);

        return CacheService::remember(
            "{$kebab}-{$ip}",
            fn () => self::whereType($type)->whereIp($ip)->exists(),
            now()->addDay(),
            $kebab,
        );
    }
}
