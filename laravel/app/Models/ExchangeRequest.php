<?php

namespace App\Models;

use App\Casts\AsFile;
use App\Enums\CryptoPayments\PaymentGatewayEnum;
use App\Enums\Transaction\ExchangeRequestStatusEnum;
use App\Enums\Transaction\ExchangeRequestViaEnum;
use App\Enums\Transaction\MoneyTypeEnum;
use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Observers\ExchangeRequestObserver;
use App\Sorts\SortByBank;
use App\Sorts\SortByUser;
use App\Utils\Services\SystemSettingsService;
use App\Utils\Services\Utils;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;

#[ObservedBy([ExchangeRequestObserver::class])]
class ExchangeRequest extends BaseModel
{
    protected $fillable = [
        'type',
        'ip_address',
        'requested_money',
        'approved_money',
        'before_money',
        'after_money',
        'user_bank_id',
        'bank',
        'status',
        'description', // memo
        'metadata', // for crypto withdrawal data
        'is_first_request',
        'via',
        'gateway',
        'bank_account_id',
        'receiving_bank',
        'transaction_number',
        'receipt_path',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_by',
        'restored_at',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'requested_money' => 'float',
        'approved_money' => 'float',
        'before_money' => 'float',
        'after_money' => 'float',
        'restored_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'bank' => 'json',
        'metadata' => 'json', // for crypto withdrawal data
        'type' => TransactionTypeEnum::class,
        'status' => ExchangeRequestStatusEnum::class,
        'via' => ExchangeRequestViaEnum::class,
        'gateway' => PaymentGatewayEnum::class,
        'receipt_path' => AsFile::class.':files/exchange_request_receipts',
        'receiving_bank' => 'json',
    ];

    public function default_bank()
    {
        return $this->belongsTo(UserBank::class, 'user_bank_id');
    }

    public static function getFilters()
    {
        return [
            'ip_address',
            AllowedFilter::exact('status'),
            AllowedFilter::exact('type'),
            AllowedFilter::exact('via'),
            AllowedFilter::exact('bank_account_id'),
            AllowedFilter::exact('transaction_number'),
            'description',
            AllowedFilter::exact('default_bank.account_number'),
            AllowedFilter::exact('default_bank.account_holder'),
            ...self::getCreatorModifierFilters(),
            AllowedFilter::scope('approved_after'),
            AllowedFilter::scope('approved_before'),
            AllowedFilter::scope('rejected_after'),
            AllowedFilter::scope('rejected_before'),
        ];
    }

    public static function getSorts()
    {
        return [
            'type',
            'ip_address',
            'requested_money',
            'approved_money',
            'before_money',
            'after_money',
            'status',
            'description',
            'approved_at',
            'rejected_at',
            'via',
            'bank_account_id',
            'transaction_number',
            AllowedSort::custom('created_by.name', new SortByUser),
            AllowedSort::custom('created_by.ref_code', new SortByUser),
            AllowedSort::custom('created_by.username', new SortByUser),
            AllowedSort::custom('user_bank_id.account_number', new SortByBank),
            AllowedSort::custom('user_bank_id.account_holder', new SortByBank),
            ...self::getCreatorModifierSorts(),
        ];
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', [
            ExchangeRequestStatusEnum::PENDING,
            ExchangeRequestStatusEnum::PENDING_VERIFICATION,
            ExchangeRequestStatusEnum::PROCESSING,
        ]);
    }

    public function isAutoApproved()
    {
        if ($this->type === TransactionTypeEnum::POINTS_EXCHANGE) {
            return SystemSettingsService::isPointsRequestAutoApproved($this->creator);
        }

        if ($this->type === TransactionTypeEnum::COUPON_POINTS_EXCHANGE) {
            return SystemSettingsService::isCouponPointsRequestAutoApproved($this->creator);
        }

        return false;
    }

    public function moneyType(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->type === TransactionTypeEnum::POINTS_EXCHANGE) {
                    return MoneyTypeEnum::POINTS;
                }

                if ($this->type === TransactionTypeEnum::COUPON_POINTS_EXCHANGE) {
                    return MoneyTypeEnum::COUPON_POINTS;
                }

                if ($this->type === TransactionTypeEnum::WITHDRAW_ROLLING_MONEY) {
                    return MoneyTypeEnum::ROLLING_MONEY;
                }

                if ($this->type === TransactionTypeEnum::WITHDRAW_LOSING_MONEY) {
                    return MoneyTypeEnum::LOSING_MONEY;
                }

                return MoneyTypeEnum::MONEY;
            }
        );
    }

    public function autoApprove()
    {
        $transaction = Transaction::createTransaction(
            $this->type,
            $this->requested_money,
            $this->money_type,
            $this->creator,
            $this,
        );

        $actor = SystemSettingsService::getSystemUser();

        $user = auth()->user();
        $user->refresh();

        Transaction::withoutEvents(function () use ($transaction, $actor, $user) {
            $transaction->update([
                'created_by' => $actor ? $actor->id : $user->id,
            ]);
        });

        $approvedMoney = Utils::calculateMoneyAgainstPoints($transaction->money);

        $afterMoney = 0;
        if ($this->money_type === MoneyTypeEnum::POINTS) {
            $afterMoney = $user->wallet->points;
        }

        if ($this->money_type === MoneyTypeEnum::COUPON_POINTS) {
            $afterMoney = $user->wallet->coupon_points;
        }

        $this->approve(ExchangeRequestStatusEnum::APPROVED, [
            'approved_money' => $approvedMoney,
            'after_money' => $afterMoney,
            'approved_by' => $actor ? $actor->id : $user->id,
            'updated_by' => $actor ? $actor->id : $user->id,
        ], cb: fn ($record) => $record->afterApprove($transaction));
    }

    public function afterApprove(Transaction $transaction)
    {
        if ($this->type === TransactionTypeEnum::DEPOSIT && $this->creator) {
            Transaction::createReferralBonusPointsTransaction($this->creator, $this->approved_money);
        }

        return $transaction->createAffectedTransaction();
    }

    public function category(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->type === TransactionTypeEnum::DEPOSIT) {
                    return TransactionCategoryEnum::MONEY_DEPOSITED;
                }
                if ($this->type === TransactionTypeEnum::WITHDRAW) {
                    return TransactionCategoryEnum::MONEY_WITHDRAWAL;
                }
                if ($this->type === TransactionTypeEnum::POINTS_EXCHANGE) {
                    return TransactionCategoryEnum::CONVERTED_POINTS_TO_MONEY;
                }
                if ($this->type === TransactionTypeEnum::COUPON_POINTS_EXCHANGE) {
                    return TransactionCategoryEnum::CONVERTED_COUPON_POINTS_TO_MONEY;
                }
                if ($this->type === TransactionTypeEnum::WITHDRAW_ROLLING_MONEY) {
                    return TransactionCategoryEnum::ROLLING_MONEY_WITHDRAWAL;
                }
                if ($this->type === TransactionTypeEnum::WITHDRAW_LOSING_MONEY) {
                    return TransactionCategoryEnum::LOSING_MONEY_WITHDRAWAL;
                }

                return null;
            }
        );
    }

    public function bank_account()
    {
        return $this->belongsTo(BankAccount::class, 'bank_account_id');
    }

    public function scopeNowPayments($query)
    {
        return $query->where('gateway', PaymentGatewayEnum::NOWPAYMENTS);
    }

    public function scopeCryptoments($query)
    {
        return $query->where('gateway', PaymentGatewayEnum::CRYPTOMENTS);
    }
}
