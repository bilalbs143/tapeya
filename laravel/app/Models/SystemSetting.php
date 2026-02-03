<?php

namespace App\Models;

use App\Enums\SystemSetting\SystemSettingGroupEnum;
use App\Enums\SystemSetting\SystemSettingKeyEnum;
use App\Enums\SystemSetting\SystemSettingTypeEnum;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Spatie\QueryBuilder\AllowedFilter;

class SystemSetting extends BaseModel
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'key' => SystemSettingKeyEnum::class,
        'type' => SystemSettingTypeEnum::class,
        'group' => SystemSettingGroupEnum::class,
        'value' => 'encrypted',
        'restored_at' => 'datetime',
    ];

    public function plainValue(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->type?->resolveValue($this->key, $this->value);
            }
        );
    }

    public static function getFilters()
    {
        return [
            AllowedFilter::exact('key'),
            AllowedFilter::exact('type'),
            AllowedFilter::exact('group'),
            'description',
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'type',
            'key',
            'group',
            ...self::getCreatorModifierSorts(),
        ];
    }

    public function description(): Attribute
    {
        return Attribute::make(
            get: fn () => __($this->description),
        );
    }

    public static function getValue(SystemSettingKeyEnum $key)
    {
        return self::where('key', $key)->first()?->plain_value ?? null;
    }
}
