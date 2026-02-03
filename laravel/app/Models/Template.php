<?php

namespace App\Models;

use App\Enums\Template\TemplateTypeEnum;
use Spatie\QueryBuilder\AllowedFilter;

class Template extends BaseModel
{
    protected $fillable = [
        'type',
        'title',
        'content',
        'is_active',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'restored_at' => 'datetime',
        'type' => TemplateTypeEnum::class,
    ];

    public static function getFilters()
    {
        return [
            'title',
            'content',
            'type',
            AllowedFilter::exact('is_active'),
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'title',
            'content',
            'type',
            'is_active',
            ...self::getCreatorModifierSorts(),
        ];
    }
}
