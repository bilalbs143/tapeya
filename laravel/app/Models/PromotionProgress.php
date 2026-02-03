<?php

namespace App\Models;

use App\Enums\Promotion\PromotionProgressStateEnum;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\QueryBuilder\AllowedFilter;

class PromotionProgress extends BaseModel
{
    protected $fillable = [
        'promotion_id',
        'user_id',
        'state',
        'turnover',
        'net_win_loss',
        'meta',
        'activated_at',
        'completed_at',
        'forfeited_at',
        'reason',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_by',
    ];

    protected function casts(): array
    {
        return [
            'turnover' => 'double',
            'net_win_loss' => 'double',
            'meta' => 'array',
            'activated_at' => 'datetime',
            'completed_at' => 'datetime',
            'forfeited_at' => 'datetime',
            ...$this->commonCasts(),
        ];
    }

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function getFilters()
    {
        return [
            AllowedFilter::exact('promotion_id'),
            AllowedFilter::exact('user_id'),
            AllowedFilter::exact('state'),
            ...self::getUserFilters(),
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'turnover',
            'net_win_loss',
            'activated_at',
            'completed_at',
            'state',
            ...self::getCreatorModifierSorts(),
        ];
    }

    public function stateEnum(): PromotionProgressStateEnum
    {
        return PromotionProgressStateEnum::from($this->state);
    }
}
