<?php

namespace App\Models;

use App\Casts\AsFile;
use Spatie\QueryBuilder\AllowedFilter;

class Popup extends BaseModel
{
    protected $fillable = [
        'title',
        'content',
        'image',
        'is_active',
        'start_date',
        'end_date',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'image' => AsFile::class,
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'restored_at' => 'datetime',
    ];

    public static function getFilters()
    {
        return [
            'title',
            'content',
            AllowedFilter::exact('is_active'),
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'title',
            'content',
            'is_active',
            ...self::getCreatorModifierSorts(),
        ];
    }
}
