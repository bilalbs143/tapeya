<?php

namespace App\Models;

use App\Enums\User\UserLocaleEnum;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Bank extends BaseModel
{
    protected $fillable = [
        'name',
        'names',
        'code',
        'is_active',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'names' => 'array',
        'restored_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function name(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (request()->user()?->locale === UserLocaleEnum::en->value) {
                    return $this->names['en'];
                }

                return $this->attributes['name'];
            }
        );
    }

    public static function getFilters()
    {
        return [
            'name',
            'code',
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'name',
            'code',
            'is_active',
            ...self::getCreatorModifierSorts(),
        ];
    }

    public function scopeActive($query)
    {
        $query->where('is_active', true);
    }
}
