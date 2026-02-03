<?php

namespace App\Models;

use App\Enums\SoundSettings\SoundSettingsTypeEnum;

class SoundSetting extends BaseModel
{
    protected $fillable = [
        'type',
        'sound_id',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'restored_at' => 'datetime',
        'type' => SoundSettingsTypeEnum::class,
    ];

    public static function getFilters()
    {
        return [
            'type',
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'type',
            ...self::getCreatorModifierSorts(),
        ];
    }

    public function sound()
    {
        return $this->belongsTo(Sound::class);
    }
}
