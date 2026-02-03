<?php

namespace App\Models;

use App\Casts\AsFile;

class Sound extends BaseModel
{
    protected $fillable = [
        'title',
        'memo',
        'file',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'file' => AsFile::class.':files',
        'restored_at' => 'datetime',
    ];

    public static function getFilters()
    {
        return [
            'title',
            'memo',
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'title',
            'memo',
            ...self::getCreatorModifierSorts(),
        ];
    }
}
