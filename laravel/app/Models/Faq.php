<?php

namespace App\Models;

use App\Enums\Faq\FaqCategoryEnum;
use Spatie\QueryBuilder\AllowedFilter;

class Faq extends BaseModel
{
    protected $fillable = [
        'category',
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
        'category' => FaqCategoryEnum::class,
    ];

    public static function getFilters()
    {
        return [
            'title',
            'content',
            'category',
            AllowedFilter::exact('is_active'),
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'title',
            'content',
            'category',
            'is_active',
            ...self::getCreatorModifierSorts(),
        ];
    }
}
