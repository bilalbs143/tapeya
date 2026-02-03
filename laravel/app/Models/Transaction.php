<?php

namespace App\Models;

use App\Builders\TransactionBuilder;
use App\Enums\SystemSetting\SystemSettingKeyEnum;
use App\Enums\Transaction\MoneyTypeEnum;
use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionSourceEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Sorts\SortByUser;
use App\Sorts\SortByUserByBank;
use App\Utils\Traits\Model\TransactionTrait;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;

class Transaction extends BaseModel
{
    use TransactionTrait;

    protected $fillable = [
        'user_id',
        'transaction_number',
        'user_wallet_id',
        'exchange_request_id',
        'source_transaction_id',
        'type',
        'sub_type',
        'ip_address',
        'source',
        'before_money',
        'money',
        'after_money',
        'memo',
        'txn_id',
        'user_game_session_id',
        'reference_debit_transaction_id',
        'reference_credit_transaction_id',
        'transaction_result_id',
        'game_id',
        'company_id',
        'provider_id',
        'company_game_id',
        'company_round_id',
        'company_jackpot_id',
        'company_campaign_id',
        'company_campaign_type',
        'company_request_body',
        'canceled_at',
        'refunded_at',
        'round_ended_at',
        'rolled_back_at',
        'reference_number',
        'created_by',
        'given_to',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected function casts()
    {
        return [
            'before_money' => 'float',
            'money' => 'float',
            'after_money' => 'float',
            'category' => TransactionCategoryEnum::class,
            'type' => TransactionTypeEnum::class,
            'sub_type' => MoneyTypeEnum::class,
            'source' => TransactionSourceEnum::class,
            'company_request_body' => 'array',
            'canceled_at' => 'datetime',
            'refunded_at' => 'datetime',
            'round_ended_at' => 'datetime',
            'rolled_back_at' => 'datetime',
            ...$this->commonCasts(),
        ];
    }

    public function newEloquentBuilder($query): TransactionBuilder
    {
        return new TransactionBuilder($query);
    }

    public function result_cards()
    {
        return $this->hasOne(GameResultCard::class);
    }

    public function source_transaction()
    {
        return $this->belongsTo(self::class, 'source_transaction_id');
    }

    public function exchange_request()
    {
        return $this->belongsTo(ExchangeRequest::class);
    }

    public function wallet()
    {
        return $this->belongsTo(UserWallet::class);
    }

    public function transaction_result()
    {
        return $this->belongsTo(TransactionResult::class);
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'given_to');
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public static function getFilters()
    {
        return [
            'transaction_number',
            AllowedFilter::exact('type'),
            AllowedFilter::exact('category'),
            AllowedFilter::exact('sub_type'),
            AllowedFilter::exact('source_transaction.type'),
            AllowedFilter::exact('source_transaction.sub_type'),
            'ip_address',
            AllowedFilter::exact('source'),
            'memo',
            ...self::getUserFilters(),
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'transaction_number',
            'type',
            'sub_type',
            'ip_address',
            'source',
            'before_money',
            'money',
            'after_money',
            'memo',
            AllowedSort::custom('user_id.username', new SortByUser),
            AllowedSort::custom('user_id.name', new SortByUser),
            AllowedSort::custom('user_id.account_holder', new SortByUserByBank),
            AllowedSort::custom('user_id.account_number', new SortByUserByBank),
            ...self::getCreatorModifierSorts(),
        ];
    }

    public function amount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->money
        );
    }

    public function refund_transaction()
    {
        return $this->hasOne(self::class, 'reference_debit_transaction_id');
    }

    public function win_transaction()
    {
        return $this->hasOne(self::class, 'reference_credit_transaction_id');
    }

    public static function createReferralBonusPointsTransaction(User $user, float $approvedMoney = 0)
    {
        if (empty($user->referredBy)) {
            return null;
        }

        // Check if referral bonus has already been given for this user (first deposit only)
        $hasReceivedReferralBonus = self::where('category', TransactionCategoryEnum::REFFERAL_BONUS_POINTS)
            ->where('given_by', $user->id)
            ->exists();

        if ($hasReceivedReferralBonus) {
            return null;
        }

        // Check if the referrer has a custom referral_bonus_percentage value set
        // If not null, use it; otherwise fall back to system setting
        $referrer = $user->referredBy;
        $percentage = null;
        $memo = "Referral Bonus Points for {$user->username}";

        if (! is_null($referrer->referral_bonus_percentage)) {
            $percentage = $referrer->referral_bonus_percentage;
            $memo = $referrer->referral_bonus_percentage_memo;
        } else {
            $percentage = SystemSetting::getValue(SystemSettingKeyEnum::REFFERAL_BONUS_PERCENTAGE);
        }

        if (empty($percentage) || $percentage <= 0) {
            return null;
        }

        // If no approved_money provided, skip (for backward compatibility with old calls)
        if ($approvedMoney <= 0) {
            return null;
        }

        // Calculate points based on percentage of approved_money
        // percentage is stored as a number (e.g., 5 for 5%)
        // Round to nearest integer (no float values)
        $points = round(($approvedMoney * $percentage) / 100);

        if ($points <= 0) {
            return null;
        }

        return self::createTransaction(
            type: TransactionTypeEnum::POINTS_CREDITED,
            amount: $points,
            moneyType: MoneyTypeEnum::POINTS,
            user: $referrer,
            source: TransactionSourceEnum::REFFERAL_BONUS,
            category: TransactionCategoryEnum::REFFERAL_BONUS_POINTS,
            givenBy: $user->id,
            memo: $memo,
        );
    }
}
