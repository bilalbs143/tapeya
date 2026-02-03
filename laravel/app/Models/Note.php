<?php

namespace App\Models;

use App\Enums\Note\NoteCategoryEnum;
use Spatie\QueryBuilder\AllowedFilter;

class Note extends BaseModel
{
    protected $fillable = [
        'category',
        'title',
        'content',
        'is_active',
        'agent_id',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'restored_at' => 'datetime',
        'category' => NoteCategoryEnum::class,
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

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id', 'id');
    }

    public function users()
    {
        return $this->hasMany(NoteUser::class);
    }
}
