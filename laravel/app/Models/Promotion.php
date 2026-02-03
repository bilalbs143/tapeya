<?php

namespace App\Models;

use App\Casts\AsFile;
use App\Enums\Common\StatusEnum;
use App\Enums\Promotion\PromotionTypeEnum;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

class Promotion extends BaseModel
{
    protected $fillable = [
        'name',
        'type',
        'status',
        'valid_from',
        'valid_to',
        'is_stackable',
        'is_visible',
        'image',
        'game_scope',
        'config',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_by',
    ];

    protected function casts(): array
    {
        return [
            'valid_from' => 'datetime',
            'valid_to' => 'datetime',
            'is_stackable' => 'boolean',
            'is_visible' => 'boolean',
            'image' => AsFile::class,
            'game_scope' => 'array',
            'config' => 'array',
            ...$this->commonCasts(),
        ];
    }

    public function progress(): HasMany
    {
        return $this->hasMany(PromotionProgress::class);
    }

    public static function getFilters()
    {
        return [
            'name',
            AllowedFilter::exact('type'),
            AllowedFilter::exact('status'),
            AllowedFilter::exact('is_stackable'),
            AllowedFilter::exact('is_visible'),
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'name',
            'valid_from',
            'valid_to',
            'status',
            'type',
            ...self::getCreatorModifierSorts(),
        ];
    }

    public function isActive(): bool
    {
        $now = now();

        $inWindow = (! $this->valid_from || $this->valid_from <= $now)
            && (! $this->valid_to || $this->valid_to >= $now);

        return $this->status === StatusEnum::ACTIVE->value && $inWindow;
    }

    public function typeEnum(): PromotionTypeEnum
    {
        return PromotionTypeEnum::from($this->type);
    }
}
