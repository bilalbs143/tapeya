<?php

namespace App\Models;

use App\Enums\GameResultCard\GameResultCardStatusEnum;
use App\Enums\GameResultCard\GameResultCardTypeEnum;
use App\Sorts\SortByUser;
use App\Sorts\SortByUserByBank;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;

class GameResultCard extends BaseModel
{
    protected $fillable = [
        'user_id',
        'game_id',
        'company_id',
        'provider_id',
        'transaction_id',
        'round_id',
        'type',
        'status',
        'raw_data',
        'data',
        'fetched_at',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'type' => GameResultCardTypeEnum::class,
        'status' => GameResultCardStatusEnum::class,
        'raw_data' => 'array',
        'data' => 'array',
        'fetched_at' => 'datetime',
        'restored_at' => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public static function getFilters()
    {
        return [
            AllowedFilter::exact('game_id'),
            AllowedFilter::exact('company_id'),
            AllowedFilter::exact('provider_id'),
            AllowedFilter::exact('transaction_id'),
            AllowedFilter::exact('round_id'),
            AllowedFilter::exact('type'),
            AllowedFilter::exact('status'),
            ...self::getUserFilters(),
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'type',
            'status',
            'fetched_at',
            AllowedSort::custom('user_id.username', new SortByUser),
            AllowedSort::custom('user_id.name', new SortByUser),
            AllowedSort::custom('user_id.account_holder', new SortByUserByBank),
            AllowedSort::custom('user_id.account_number', new SortByUserByBank),
            ...self::getCreatorModifierSorts(),
        ];
    }
}
