<?php

namespace App\Models;

use App\Builders\CompanyBuilder;
use App\Enums\Company\CompanyEnum;
use App\Utils\Services\Utils;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Spatie\QueryBuilder\AllowedFilter;

class Company extends BaseModel
{
    protected $fillable = [
        'key',
        'configurations',
        'is_production',
        'disabled_at',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'key' => CompanyEnum::class,
        'configurations' => 'array',
        'is_production' => 'boolean',
        'disabled_at' => 'datetime',
        'restored_at' => 'datetime',
    ];

    public function newEloquentBuilder($query): CompanyBuilder
    {
        return new CompanyBuilder($query);
    }

    public static function getFilters()
    {
        return [
            AllowedFilter::exact('key'),
            AllowedFilter::exact('is_production'),
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'key',
            'is_production',
            'disabled_at',
            ...self::getCreatorModifierSorts(),
        ];
    }

    public function config(): Attribute
    {
        return Attribute::make(
            get: fn () => Utils::getArrayValue($this->configurations, Utils::configKey($this)),
        );
    }

    public function getConfig(string $key, $default = null): mixed
    {
        $value = Utils::getArrayValue($this->config, $key) ?: $default;

        return Utils::resolveMagicValue($value);
    }

    public function providers()
    {
        return $this->hasMany(Provider::class);
    }
}
