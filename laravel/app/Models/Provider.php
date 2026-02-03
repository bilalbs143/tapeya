<?php

namespace App\Models;

class Provider extends BaseModel
{
    protected $fillable = [
        'company_id',
        'key',
        'name',
        'disabled_at',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'disabled_at' => 'datetime',
        'restored_at' => 'datetime',
    ];

    public static function getFilters()
    {
        return [
            'key',
            'name',
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'key',
            'name',
            'disabled_at',
            ...self::getCreatorModifierSorts(),
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeCompanyId($q, int $companyId)
    {
        $q->whereCompanyId($companyId);
    }

    public function scopeActive($q)
    {
        $q->whereNull('disabled_at');
    }

    public function isDisabled()
    {
        return $this->disabled_at !== null;
    }
}
