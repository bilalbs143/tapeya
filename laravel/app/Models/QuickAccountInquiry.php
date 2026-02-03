<?php

namespace App\Models;

use App\Sorts\SortByUser;
use App\Sorts\SortByUserByBank;
use Spatie\QueryBuilder\AllowedSort;

class QuickAccountInquiry extends BaseModel
{
    protected $fillable = [
        'name',
        'phone',
        'message',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'restored_at' => 'datetime',
    ];

    public static function getFilters()
    {
        return [
            'name',
            'phone',
            'message',
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'name',
            'phone',
            'message',
            AllowedSort::custom('created_by.username', new SortByUser),
            AllowedSort::custom('created_by.name', new SortByUser),
            AllowedSort::custom('created_by.account_holder', new SortByUserByBank),
            AllowedSort::custom('created_by.account_number', new SortByUserByBank),
            ...self::getCreatorModifierSorts(),
        ];
    }
}
