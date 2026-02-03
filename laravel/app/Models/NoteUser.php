<?php

namespace App\Models;

use App\Sorts\SortByUser;
use App\Sorts\SortByUserByBank;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;

class NoteUser extends BaseModel
{
    protected $fillable = [
        'note_id',
        'user_id',
        'read_by',
        'read_at',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'restored_at' => 'datetime',
    ];

    public function scopeRead(Builder $query)
    {
        $query->whereNotNull('read_at');
    }

    public function scopeUnread(Builder $query)
    {
        $query->whereNull('read_at');
    }

    public static function getFilters()
    {
        return [
            'note.title',
            'note.content',
            'note.category',
            'note.is_active',
            ...self::getUserFilters(),
            AllowedFilter::exact('user.id'),
            AllowedFilter::exact('note.agent_id'),
            AllowedFilter::scope('read'),
            AllowedFilter::scope('unread'),
            AllowedFilter::scope('read_after'),
            AllowedFilter::scope('read_before'),
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'read_at',
            AllowedSort::custom('user_id.username', new SortByUser),
            AllowedSort::custom('user_id.name', new SortByUser),
            AllowedSort::custom('user_id.account_holder', new SortByUserByBank),
            AllowedSort::custom('user_id.account_number', new SortByUserByBank),
            ...self::getCreatorModifierSorts(),
        ];
    }

    public function note()
    {
        return $this->belongsTo(Note::class);
    }
}
