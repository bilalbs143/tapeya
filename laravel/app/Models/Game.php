<?php

namespace App\Models;

use App\Builders\GameBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class Game extends BaseModel
{
    protected $fillable = [
        'company_id',
        'provider_id',
        'company_name',
        'sub_provider',
        'game_id',
        'launch_identifier',
        'name',
        'image_url',
        'game_id_numeric',
        'type',
        'description',
        'is_live_game',
        'is_enabled',
        'has_freespins',
        'has_jackpot',
        'is_slot_game',
        'is_demo_game_available',
        'is_new',
        'is_trending',
        'is_video_slot',
        'is_arcade_slot',
        'is_casual_slot',
        'is_fishing_slot',
        'is_table_slot',
        'is_blackjack_casino',
        'is_baccarat_casino',
        'is_roulette_casino',
        'is_poker',
        'is_recommended',
        'is_sport',
        'is_lobby_game',
        'released_at',
        'recalled_at',
        'jurisdictions',
        'game',
        'disabled_at',
        'disabled_by_admin_at',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'jurisdictions' => 'array',
        'game' => 'array',
        'released_at' => 'date',
        'recalled_at' => 'date',
        'restored_at' => 'date',
        'disabled_at' => 'datetime',
        'disabled_by_admin_at' => 'datetime',
    ];

    public function newEloquentBuilder($query): GameBuilder
    {
        return new GameBuilder($query);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public static function getFilters()
    {
        return [
            AllowedFilter::exact('company_id'),
            AllowedFilter::exact('provider_id'),
            'sub_provider',
            AllowedFilter::exact('game_id'),
            AllowedFilter::exact('launch_identifier'),
            'name',
            AllowedFilter::exact('game_id_numeric'),
            'type',
            'description',
            AllowedFilter::exact('is_live_game'),
            AllowedFilter::exact('is_enabled'),
            AllowedFilter::exact('has_freespins'),
            AllowedFilter::exact('has_jackpot'),
            AllowedFilter::exact('is_slot_game'),
            AllowedFilter::exact('is_demo_game_available'),
            AllowedFilter::exact('is_new'),
            AllowedFilter::exact('is_trending'),
            AllowedFilter::exact('is_video_slot'),
            AllowedFilter::exact('is_arcade_slot'),
            AllowedFilter::exact('is_casual_slot'),
            AllowedFilter::exact('is_fishing_slot'),
            AllowedFilter::exact('is_table_slot'),
            AllowedFilter::exact('is_blackjack_casino'),
            AllowedFilter::exact('is_baccarat_casino'),
            AllowedFilter::exact('is_roulette_casino'),
            AllowedFilter::exact('is_poker'),
            AllowedFilter::exact('is_recommended'),
            AllowedFilter::exact('is_sport'),
            AllowedFilter::exact('is_lobby_game'),
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'sub_provider',
            'name',
            'type',
            'description',
            ...self::getCreatorModifierSorts(),
        ];
    }

    public function launch(string $language = 'en')
    {
        return $this->company->key->service()->launch($this, $language);
    }
}
