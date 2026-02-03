<?php

namespace App\Models;

use App\Enums\Membership\LevelsEnum;
use App\Utils\Services\Utils;
use Spatie\QueryBuilder\AllowedFilter;

class MembershipCommissionSetting extends BaseModel
{
    protected $fillable = [
        'level',
        'new_signup_first_recharge_bonus',
        'new_signup_first_recharge_bonus_maximum_amount',
        'first_recharge_bonus_of_day',
        'first_recharge_bonus_of_day_maximum_amount',
        'bonus_per_recharge',
        'bonus_per_recharge_maximum_amount',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'new_signup_first_recharge_bonus' => 'float',
        'new_signup_first_recharge_bonus_maximum_amount' => 'float',
        'first_recharge_bonus_of_day' => 'float',
        'first_recharge_bonus_of_day_maximum_amount' => 'float',
        'bonus_per_recharge' => 'float',
        'bonus_per_recharge_maximum_amount' => 'float',
        'level' => LevelsEnum::class,
        'restored_at' => 'datetime',
    ];

    public static function getFilters()
    {
        return [
            AllowedFilter::exact('level'),
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'level',
            'new_signup_first_recharge_bonus',
            'new_signup_first_recharge_bonus_maximum_amount',
            'first_recharge_bonus_of_day',
            'first_recharge_bonus_of_day_maximum_amount',
            'bonus_per_recharge',
            'bonus_per_recharge_maximum_amount',
            ...self::getCreatorModifierSorts(),
        ];
    }

    public function getCommission(float $amount, string $type)
    {
        $commission = Utils::calculatePercentage($amount, $this->{$type});

        if ($commission > $this->{"{$type}_maximum_amount"}) {
            $commission = $this->{"{$type}_maximum_amount"};
        }

        $commission = (int) floor($commission);

        return $commission;

    }
}
