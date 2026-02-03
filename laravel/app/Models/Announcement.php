<?php

namespace App\Models;

use App\Enums\Announcement\AnnouncementCategoryEnum;
use Spatie\QueryBuilder\AllowedFilter;

class Announcement extends BaseModel
{
    protected $fillable = [
        'category',
        'title',
        'content',
        'is_active',
        'marked_as_important_at',
        'marked_as_important_by',
        'expires_at',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'restored_at' => 'datetime',
        'category' => AnnouncementCategoryEnum::class,
        'marked_as_important_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public static function getFilters()
    {
        return [
            'title',
            'content',
            'category',
            AllowedFilter::exact('is_active'),
            AllowedFilter::scope('important'),
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

    public function scopeActive($query)
    {
        $query->where('is_active', true)->notExpired();
    }

    public function scopeNotExpired($query)
    {
        $query->where('expires_at', '>=', now())->orWhereNull('expires_at');
    }

    public function scopeImportant($query)
    {
        $query->whereNotNull('marked_as_important_at');
    }

    public function scopeNotImportant($query)
    {
        $query->whereNull('marked_as_important_at');
    }

    public function isImportant()
    {
        return ! empty($this->marked_as_important_at);
    }
}
