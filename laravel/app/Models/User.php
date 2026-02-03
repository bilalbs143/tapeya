<?php

namespace App\Models;

use App\Enums\Membership\LevelsEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Observers\UserObserver;
use App\Services\QrCodeService;
use App\Sorts\SortByChildBank;
use App\Sorts\SortByWallet;
use App\Utils\Traits\Model\BaseModelTrait;
use App\Utils\Traits\Model\UserTrait;
use Carbon\Carbon;
use Illuminate\Contracts\Translation\HasLocalePreference;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Yadahan\AuthenticationLog\AuthenticationLogable;

#[ObservedBy([UserObserver::class])]
class User extends Authenticatable implements HasLocalePreference
{
    use AuthenticationLogable, BaseModelTrait, HasApiTokens, HasFactory, HasRoles, Notifiable, SoftDeletes, UserTrait;

    protected $fillable = [
        'parent_id',
        'referred_by',
        'name',
        'type',
        'ref_code',
        'image',
        'email',
        'username',
        'nickname',
        'password',
        'locale',
        'phone',
        'dob',
        'memo',
        'losing_point_ratio',
        'rolling_ratio',
        'level',
        'created_at_ip',
        'status',
        'is_test',
        'blocked_at',
        'blocked_reason',
        'blocked_by',
        'is_new_signup_first_recharge_bonus_enabled',
        'is_first_recharge_bonus_of_day_enabled',
        'is_bonus_per_recharge_enabled',
        'is_weekly_loss_bonus_enabled',
        'referral_bonus_percentage',
        'referral_bonus_percentage_memo',
        'referral_link_qr_code_path',
        'referral_link_qr_code_expires_at',
        'restored_at',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_by',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'level' => LevelsEnum::class,
        'losing_point_ratio' => 'float',
        'rolling_ratio' => 'float',
        'referral_bonus_percentage' => 'float',
        'blocked_at' => 'datetime',
        'restored_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'referral_link_qr_code_expires_at' => 'datetime',
        'password' => 'hashed',
        'is_new_signup_first_recharge_bonus_enabled' => 'boolean',
        'is_first_recharge_bonus_of_day_enabled' => 'boolean',
        'is_bonus_per_recharge_enabled' => 'boolean',
        'is_weekly_loss_bonus_enabled' => 'boolean',
        'status' => UserStatusEnum::class,
        'type' => UserTypeEnum::class,
    ];

    public function getDescriptionForEvent(string $eventName): string
    {
        $username = $this->username;

        return "{$username} has been {$eventName}.";
    }

    public function dob(): Attribute
    {
        return Attribute::make(
            get: fn ($dob) => $dob ? Carbon::parse($dob)->format('Y-m-d') : null,
        );
    }

    public function getAllParents()
    {
        $parents = [];
        $currentUser = $this;

        while ($currentUser->parent) {
            $parents[] = $currentUser->parent;
            $currentUser = $currentUser->parent;
        }

        return $parents;
    }

    public function getAllParentsFromParentToChild()
    {
        return array_reverse($this->getAllParents());
    }

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id', 'id')->agent();
    }

    public function children()
    {
        return $this->hasMany(User::class, 'parent_id', 'id')->agent();
    }

    public function referredBy()
    {
        return $this->belongsTo(User::class, 'referred_by', 'id');
    }

    public function referredUsers()
    {
        return $this->hasMany(User::class, 'referred_by', 'id');
    }

    public function grand_children()
    {
        return $this->children()->select('id', 'parent_id', 'username', 'name', 'losing_point_ratio', 'rolling_ratio', 'level')->with('grand_children');
    }

    public function grand_children_count()
    {
        $count = $this->grand_children->count();

        foreach ($this->children as $child) {
            $count += $child->grand_children_count();
        }

        return $count;
    }

    public function members()
    {
        return $this->hasMany(User::class, 'parent_id', 'id')->member();
    }

    public function allMembers()
    {
        $allMembers = $this->members;

        foreach ($this->grand_children as $grandChild) {
            $allMembers = $allMembers->merge($grandChild->allMembers());
        }

        return $allMembers;
    }

    public function allMemberIds()
    {
        $allMemberIds = $this->members()->select('id')->pluck('id')->toArray();

        foreach ($this->grand_children as $grandChild) {
            $allMemberIds = [...$allMemberIds, ...$grandChild->allMemberIds()];
        }

        return $allMemberIds;
    }

    public function allChildrenIds()
    {
        $memberIds = $this->members()->select('id')->pluck('id')->toArray();
        $agentIds = $this->children()->select('id')->pluck('id')->toArray();

        $allChildrenIds = [...$memberIds, ...$agentIds];

        foreach ($this->grand_children as $grandChild) {
            $allChildrenIds = [...$allChildrenIds, ...$grandChild->allChildrenIds()];
        }

        return $allChildrenIds;
    }

    public function bank_account()
    {
        return $this->hasOne(UserBank::class)->with('bank');
    }

    public function domains()
    {
        return $this->hasMany(UserDomain::class);
    }

    public function wallet()
    {
        return $this->hasOne(UserWallet::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function game_sessions()
    {
        return $this->hasMany(UserGameSession::class);
    }

    public function game_session()
    {
        return $this->hasOne(UserGameSession::class)->active()->latest('id');
    }

    public static function getFilters()
    {
        return [
            AllowedFilter::scope('search'),
            AllowedFilter::scope('ip'),
            AllowedFilter::exact('name'),
            AllowedFilter::exact('username'),
            AllowedFilter::exact('nickname'),
            'phone',
            'memo',
            AllowedFilter::exact('status'),
            AllowedFilter::exact('bank_account.account_number'),
            AllowedFilter::exact('bank_account.account_holder'),
            AllowedFilter::exact('ref_code'),
            AllowedFilter::exact('parent_id'),
            AllowedFilter::exact('level'),
            AllowedFilter::exact('is_new_signup_first_recharge_bonus_enabled'),
            AllowedFilter::exact('is_first_recharge_bonus_of_day_enabled'),
            AllowedFilter::exact('is_bonus_per_recharge_enabled'),
            AllowedFilter::exact('is_weekly_loss_bonus_enabled'),
            ...self::getCreatorModifierFilters(),
            AllowedFilter::scope('blocked_after'),
            AllowedFilter::scope('blocked_before'),
            AllowedFilter::scope('approved_after'),
            AllowedFilter::scope('approved_before'),
            AllowedFilter::scope('rejected_after'),
            AllowedFilter::scope('rejected_before'),
        ];
    }

    public static function getSorts()
    {
        return [
            'name',
            'username',
            'nickname',
            'ref_code',
            'blocked_at',
            'approved_at',
            'rejected_at',
            'losing_point_ratio',
            'rolling_ratio',
            'level',
            'dob',
            AllowedSort::custom('user_id.account_number', new SortByChildBank),
            AllowedSort::custom('user_id.account_holder', new SortByChildBank),
            AllowedSort::custom('id.holding_money', new SortByWallet),
            AllowedSort::custom('id.points', new SortByWallet),
            AllowedSort::custom('id.points_credited_by_admin', new SortByWallet),
            AllowedSort::custom('id.points_credited_by_admin_count', new SortByWallet),
            AllowedSort::custom('id.points_credited_by_referal_code', new SortByWallet),
            AllowedSort::custom('id.points_credited_by_referal_code_count', new SortByWallet),
            AllowedSort::custom('id.points_debited_by_admin', new SortByWallet),
            AllowedSort::custom('id.points_debited_by_admin_count', new SortByWallet),
            AllowedSort::custom('id.points_exchange', new SortByWallet),
            AllowedSort::custom('id.points_exchange_count', new SortByWallet),
            AllowedSort::custom('id.coupon_points', new SortByWallet),
            AllowedSort::custom('id.coupon_points_credited_by_admin', new SortByWallet),
            AllowedSort::custom('id.coupon_points_credited_by_admin_count', new SortByWallet),
            AllowedSort::custom('id.coupon_points_debited_by_admin', new SortByWallet),
            AllowedSort::custom('id.coupon_points_debited_by_admin_count', new SortByWallet),
            AllowedSort::custom('id.coupon_points_credited_by_agent', new SortByWallet),
            AllowedSort::custom('id.coupon_points_credited_by_agent_count', new SortByWallet),
            AllowedSort::custom('id.coupon_points_debited_by_agent', new SortByWallet),
            AllowedSort::custom('id.coupon_points_debited_by_agent_count', new SortByWallet),
            AllowedSort::custom('id.coupon_points_exchange', new SortByWallet),
            AllowedSort::custom('id.coupon_points_exchange_count', new SortByWallet),
            AllowedSort::custom('id.deposited_money', new SortByWallet),
            AllowedSort::custom('id.deposited_money_count', new SortByWallet),
            AllowedSort::custom('id.deposited_money_by_admin', new SortByWallet),
            AllowedSort::custom('id.deposited_money_by_admin_count', new SortByWallet),
            AllowedSort::custom('id.withdrawal_money', new SortByWallet),
            AllowedSort::custom('id.withdrawal_money_count', new SortByWallet),
            AllowedSort::custom('id.withdrawal_money_by_admin', new SortByWallet),
            AllowedSort::custom('id.withdrawal_money_by_admin_count', new SortByWallet),
            AllowedSort::custom('id.total_holding_money', new SortByWallet),
            AllowedSort::custom('id.total_points', new SortByWallet),
            AllowedSort::custom('id.total_coupon_points', new SortByWallet),
            AllowedSort::custom('id.total_losing_money', new SortByWallet),
            AllowedSort::custom('id.total_rolling_money', new SortByWallet),
            AllowedSort::custom('id.total_betting_money', new SortByWallet),
            AllowedSort::custom('id.total_refunded_money', new SortByWallet),
            AllowedSort::custom('id.total_net_betting_money', new SortByWallet),
            AllowedSort::custom('id.total_winning_money', new SortByWallet),
            AllowedSort::custom('id.total_canceled_money', new SortByWallet),
            AllowedSort::custom('id.total_net_winning_money', new SortByWallet),
            AllowedSort::custom('id.total_betting_difference', new SortByWallet),
            AllowedSort::custom('id.total_net_betting_difference', new SortByWallet),
            AllowedSort::custom('id.total_jackpot_money', new SortByWallet),
            AllowedSort::custom('id.total_bonus_money', new SortByWallet),
            AllowedSort::custom('id.total_promo_win_money', new SortByWallet),
            AllowedSort::custom('id.last_deposited_money_at', new SortByWallet),
            AllowedSort::custom('id.last_deposited_money_by_admin_at', new SortByWallet),
            AllowedSort::custom('id.last_withdrawal_money_at', new SortByWallet),
            AllowedSort::custom('id.last_withdrawal_money_by_admin_at', new SortByWallet),
            AllowedSort::custom('id.last_points_exchanged_at', new SortByWallet),
            AllowedSort::custom('id.last_coupon_points_exchanged_at', new SortByWallet),
            AllowedSort::custom('id.last_points_credited_by_admin_at', new SortByWallet),
            AllowedSort::custom('id.last_points_credited_by_referal_code_at', new SortByWallet),
            AllowedSort::custom('id.last_points_debited_by_admin_at', new SortByWallet),
            AllowedSort::custom('id.last_coupon_points_credited_by_admin_at', new SortByWallet),
            AllowedSort::custom('id.last_coupon_points_debited_by_admin_at', new SortByWallet),
            AllowedSort::custom('id.last_coupon_points_credited_by_agent_at', new SortByWallet),
            AllowedSort::custom('id.last_coupon_points_debited_by_agent_at', new SortByWallet),
            AllowedSort::custom('id.rolling_money', new SortByWallet),
            AllowedSort::custom('id.rolling_money_credited', new SortByWallet),
            AllowedSort::custom('id.rolling_money_credited_count', new SortByWallet),
            AllowedSort::custom('id.last_rolling_money_credited_at', new SortByWallet),
            AllowedSort::custom('id.rolling_money_withdrawal', new SortByWallet),
            AllowedSort::custom('id.rolling_money_withdrawal_count', new SortByWallet),
            AllowedSort::custom('id.last_rolling_money_withdrawal_at', new SortByWallet),
            AllowedSort::custom('id.losing_money', new SortByWallet),
            AllowedSort::custom('id.losing_money_credited', new SortByWallet),
            AllowedSort::custom('id.losing_money_credited_count', new SortByWallet),
            AllowedSort::custom('id.last_losing_money_credited_at', new SortByWallet),
            AllowedSort::custom('id.losing_money_debited', new SortByWallet),
            AllowedSort::custom('id.losing_money_debited_count', new SortByWallet),
            AllowedSort::custom('id.last_losing_money_debited_at', new SortByWallet),
            AllowedSort::custom('id.losing_money_withdrawal', new SortByWallet),
            AllowedSort::custom('id.losing_money_withdrawal_count', new SortByWallet),
            AllowedSort::custom('id.last_losing_money_withdrawal_at', new SortByWallet),
            ...self::getCreatorModifierSorts(),
        ];
    }

    public function isActive()
    {
        return in_array($this->status, [UserStatusEnum::ACTIVE, UserStatusEnum::APPROVED]) &&
            empty($this->blocked_at) &&
            ! empty($this->approved_at) &&
            empty($this->rejected_at);
    }

    public function refLink(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->ref_code ? route('referral_link', ['referral_code' => $this->ref_code]) : null,
        );
    }

    public function websiteRefLink(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->ref_code ? env('FRONTEND_URL').'/register?referral_code='.$this->ref_code : null,
        );
    }

    public function refQrCode(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (empty($this->ref_code)) {
                    return null;
                }

                $qrCodeService = app(QrCodeService::class);

                return $qrCodeService->getReferralQrCode($this);
            }
        );
    }

    public function canDebug()
    {
        return $this->username === 'testhm';
    }
}
