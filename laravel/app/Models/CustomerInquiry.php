<?php

namespace App\Models;

use App\Enums\CustomerInquiry\CustomerInquiryCategoryEnum;
use App\Enums\CustomerInquiry\CustomerInquiryStatusEnum;
use App\Events\Admin\CustomerInquiry\CustomerInquiryReplied;
use App\Sorts\SortByUser;
use App\Sorts\SortByUserByBank;
use App\Sorts\SortByWallet;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;

class CustomerInquiry extends BaseModel
{
    protected $fillable = [
        'category',
        'title',
        'content',
        'status',
        'read_by',
        'read_at',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'restored_at' => 'datetime',
        'status' => CustomerInquiryStatusEnum::class,
        'category' => CustomerInquiryCategoryEnum::class,
    ];

    public function scopeRead(Builder $query)
    {
        $query->whereNotNull('read_at');
    }

    public function scopeUnread(Builder $query)
    {
        $query->whereNull('read_at');
    }

    public static function getFilters()
    {
        return [
            'title',
            'content',
            'category',
            'status',
            AllowedFilter::scope('read'),
            AllowedFilter::scope('unread'),
            AllowedFilter::scope('read_after'),
            AllowedFilter::scope('read_before'),
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'title',
            'content',
            'category',
            'read_at',
            AllowedSort::custom('created_by.username', new SortByUser),
            AllowedSort::custom('created_by.name', new SortByUser),
            AllowedSort::custom('created_by.account_holder', new SortByUserByBank),
            AllowedSort::custom('created_by.account_number', new SortByUserByBank),
            AllowedSort::custom('created_by.holding_money', new SortByWallet),
            AllowedSort::custom('created_by.points', new SortByWallet),
            AllowedSort::custom('created_by.points_credited_by_admin', new SortByWallet),
            AllowedSort::custom('created_by.points_credited_by_admin_count', new SortByWallet),
            AllowedSort::custom('created_by.points_credited_by_referal_code', new SortByWallet),
            AllowedSort::custom('created_by.points_credited_by_referal_code_count', new SortByWallet),
            AllowedSort::custom('created_by.points_debited_by_admin', new SortByWallet),
            AllowedSort::custom('created_by.points_debited_by_admin_count', new SortByWallet),
            AllowedSort::custom('created_by.points_exchange', new SortByWallet),
            AllowedSort::custom('created_by.points_exchange_count', new SortByWallet),
            AllowedSort::custom('created_by.coupon_points', new SortByWallet),
            AllowedSort::custom('created_by.coupon_points_credited_by_admin', new SortByWallet),
            AllowedSort::custom('created_by.coupon_points_credited_by_admin_count', new SortByWallet),
            AllowedSort::custom('created_by.coupon_points_debited_by_admin', new SortByWallet),
            AllowedSort::custom('created_by.coupon_points_debited_by_admin_count', new SortByWallet),
            AllowedSort::custom('created_by.coupon_points_credited_by_agent', new SortByWallet),
            AllowedSort::custom('created_by.coupon_points_credited_by_agent_count', new SortByWallet),
            AllowedSort::custom('created_by.coupon_points_debited_by_agent', new SortByWallet),
            AllowedSort::custom('created_by.coupon_points_debited_by_agent_count', new SortByWallet),
            AllowedSort::custom('created_by.coupon_points_exchange', new SortByWallet),
            AllowedSort::custom('created_by.coupon_points_exchange_count', new SortByWallet),
            AllowedSort::custom('created_by.deposited_money', new SortByWallet),
            AllowedSort::custom('created_by.deposited_money_count', new SortByWallet),
            AllowedSort::custom('created_by.deposited_money_by_admin', new SortByWallet),
            AllowedSort::custom('created_by.deposited_money_by_admin_count', new SortByWallet),
            AllowedSort::custom('created_by.withdrawal_money', new SortByWallet),
            AllowedSort::custom('created_by.withdrawal_money_count', new SortByWallet),
            AllowedSort::custom('created_by.withdrawal_money_by_admin', new SortByWallet),
            AllowedSort::custom('created_by.withdrawal_money_by_admin_count', new SortByWallet),
            AllowedSort::custom('created_by.total_holding_money', new SortByWallet),
            AllowedSort::custom('created_by.total_points', new SortByWallet),
            AllowedSort::custom('created_by.total_coupon_points', new SortByWallet),
            AllowedSort::custom('created_by.total_losing_money', new SortByWallet),
            AllowedSort::custom('created_by.total_rolling_money', new SortByWallet),
            AllowedSort::custom('created_by.total_betting_money', new SortByWallet),
            AllowedSort::custom('created_by.total_refunded_money', new SortByWallet),
            AllowedSort::custom('created_by.total_net_betting_money', new SortByWallet),
            AllowedSort::custom('created_by.total_winning_money', new SortByWallet),
            AllowedSort::custom('created_by.total_canceled_money', new SortByWallet),
            AllowedSort::custom('created_by.total_net_winning_money', new SortByWallet),
            AllowedSort::custom('created_by.total_betting_difference', new SortByWallet),
            AllowedSort::custom('created_by.total_net_betting_difference', new SortByWallet),
            AllowedSort::custom('created_by.total_jackpot_money', new SortByWallet),
            AllowedSort::custom('created_by.total_bonus_money', new SortByWallet),
            AllowedSort::custom('created_by.total_promo_win_money', new SortByWallet),
            AllowedSort::custom('created_by.last_deposited_money_at', new SortByWallet),
            AllowedSort::custom('created_by.last_deposited_money_by_admin_at', new SortByWallet),
            AllowedSort::custom('created_by.last_withdrawal_money_at', new SortByWallet),
            AllowedSort::custom('created_by.last_withdrawal_money_by_admin_at', new SortByWallet),
            AllowedSort::custom('created_by.last_points_exchanged_at', new SortByWallet),
            AllowedSort::custom('created_by.last_coupon_points_exchanged_at', new SortByWallet),
            AllowedSort::custom('created_by.last_points_credited_by_admin_at', new SortByWallet),
            AllowedSort::custom('created_by.last_points_credited_by_referal_code_at', new SortByWallet),
            AllowedSort::custom('created_by.last_points_debited_by_admin_at', new SortByWallet),
            AllowedSort::custom('created_by.last_coupon_points_credited_by_admin_at', new SortByWallet),
            AllowedSort::custom('created_by.last_coupon_points_debited_by_admin_at', new SortByWallet),
            AllowedSort::custom('created_by.last_coupon_points_credited_by_agent_at', new SortByWallet),
            AllowedSort::custom('created_by.last_coupon_points_debited_by_agent_at', new SortByWallet),
            AllowedSort::custom('created_by.rolling_money', new SortByWallet),
            AllowedSort::custom('created_by.rolling_money_credited', new SortByWallet),
            AllowedSort::custom('created_by.rolling_money_credited_count', new SortByWallet),
            AllowedSort::custom('created_by.last_rolling_money_credited_at', new SortByWallet),
            AllowedSort::custom('created_by.rolling_money_withdrawal', new SortByWallet),
            AllowedSort::custom('created_by.rolling_money_withdrawal_count', new SortByWallet),
            AllowedSort::custom('created_by.last_rolling_money_withdrawal_at', new SortByWallet),
            AllowedSort::custom('created_by.losing_money', new SortByWallet),
            AllowedSort::custom('created_by.losing_money_credited', new SortByWallet),
            AllowedSort::custom('created_by.losing_money_credited_count', new SortByWallet),
            AllowedSort::custom('created_by.last_losing_money_credited_at', new SortByWallet),
            AllowedSort::custom('created_by.losing_money_debited', new SortByWallet),
            AllowedSort::custom('created_by.losing_money_debited_count', new SortByWallet),
            AllowedSort::custom('created_by.last_losing_money_debited_at', new SortByWallet),
            AllowedSort::custom('created_by.losing_money_withdrawal', new SortByWallet),
            AllowedSort::custom('created_by.losing_money_withdrawal_count', new SortByWallet),
            AllowedSort::custom('created_by.last_losing_money_withdrawal_at', new SortByWallet),
            ...self::getCreatorModifierSorts(),
        ];
    }

    public function reply()
    {
        return $this->hasOne(CustomerInquiryReply::class);
    }

    public function sendReply($content)
    {
        $this->read();
        $this->update([
            'status' => CustomerInquiryStatusEnum::RESOLVED,
        ]);

        // if reply already sent, then change content and set read as null again
        if ($this->reply) {
            $this->reply->update([
                'content' => $content,
                'read_at' => null,
                'read_by' => null,
            ]);

            CustomerInquiryReplied::dispatch($this, $this->reply);

            return $this->reply;
        }

        $reply = $this->reply()->create([
            'content' => $content,
        ]);

        CustomerInquiryReplied::dispatch($this, $reply);
    }
}
