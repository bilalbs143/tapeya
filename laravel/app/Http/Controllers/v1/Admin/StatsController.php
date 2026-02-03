<?php

namespace App\Http\Controllers\v1\Admin;

use App\Enums\CustomerInquiry\CustomerInquiryStatusEnum;
use App\Enums\SoundSettings\SoundSettingsTypeEnum;
use App\Enums\Time\PeriodEnum;
use App\Enums\Transaction\ExchangeRequestStatusEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Http\Resources\v1\Activity\ActivityResource;
use App\Http\Resources\v1\Stats\Requests\RequestsCounterResource;
use App\Models\AuthenticationLog;
use App\Models\CustomerInquiry;
use App\Models\ExchangeRequest;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserWallet;
use App\Utils\Services\Companies\AntechipService;
use App\Utils\Services\Utils;
use Spatie\Activitylog\Models\Activity;

class StatsController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct();
    }

    protected function baseQuery()
    {
        return null;
    }

    public function requestsCounter(PeriodEnum $period = PeriodEnum::TODAY)
    {
        $data = collect([
            'exchange_requests' => $this->buildExchangeRequestsCounter($period),
            'membership_requests' => $this->buildMembershipRequestsCounter($period),
            'customer_inquiries' => $this->buildCustomerInquiriesCounter($period),
        ]);

        return $this->success(new RequestsCounterResource($data));
    }

    private function buildExchangeRequestsCounter(PeriodEnum $period)
    {
        return ExchangeRequest::selectRaw('
            SUM(CASE WHEN type = ? AND status = ? THEN 1 ELSE 0 END) as deposit_unprocessed_count,
            SUM(CASE WHEN type = ? AND status = ? THEN 1 ELSE 0 END) as deposit_processed_count,
            SUM(CASE WHEN type = ? AND status = ? THEN 1 ELSE 0 END) as withdraw_unprocessed_count,
            SUM(CASE WHEN type = ? AND status = ? THEN 1 ELSE 0 END) as withdraw_processed_count,
            SUM(CASE WHEN type = ? AND status = ? THEN 1 ELSE 0 END) as withdraw_losing_money_unprocessed_count,
            SUM(CASE WHEN type = ? AND status = ? THEN 1 ELSE 0 END) as withdraw_losing_money_processed_count,
            SUM(CASE WHEN type = ? AND status = ? THEN 1 ELSE 0 END) as withdraw_rolling_money_unprocessed_count,
            SUM(CASE WHEN type = ? AND status = ? THEN 1 ELSE 0 END) as withdraw_rolling_money_processed_count
        ', [
            TransactionTypeEnum::DEPOSIT, ExchangeRequestStatusEnum::PENDING,
            TransactionTypeEnum::DEPOSIT, ExchangeRequestStatusEnum::APPROVED,
            TransactionTypeEnum::WITHDRAW, ExchangeRequestStatusEnum::PENDING,
            TransactionTypeEnum::WITHDRAW, ExchangeRequestStatusEnum::APPROVED,
            TransactionTypeEnum::WITHDRAW_LOSING_MONEY, ExchangeRequestStatusEnum::PENDING,
            TransactionTypeEnum::WITHDRAW_LOSING_MONEY, ExchangeRequestStatusEnum::APPROVED,
            TransactionTypeEnum::WITHDRAW_ROLLING_MONEY, ExchangeRequestStatusEnum::PENDING,
            TransactionTypeEnum::WITHDRAW_ROLLING_MONEY, ExchangeRequestStatusEnum::APPROVED,
        ])->filterByAgentRole('created_by', true)->whereDate('created_at', $period->time())->first();
    }

    private function buildMembershipRequestsCounter(PeriodEnum $period)
    {
        return User::selectRaw('
            SUM(CASE WHEN type = ? AND status = ? THEN 1 ELSE 0 END) as unprocessed_count,
            SUM(CASE WHEN type = ? AND status = ? THEN 1 ELSE 0 END) as processed_count
        ', [
            UserTypeEnum::USER, UserStatusEnum::PENDING,
            UserTypeEnum::USER, UserStatusEnum::ACTIVE,
        ])->filterMembersByAgentRole()->whereDate('created_at', $period->time())->first();
    }

    private function buildCustomerInquiriesCounter(PeriodEnum $period)
    {
        return CustomerInquiry::selectRaw('
            SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as unprocessed_count,
            SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as processed_count
        ', [
            CustomerInquiryStatusEnum::PENDING,
            CustomerInquiryStatusEnum::RESOLVED,
        ])->filterByAgentRole('created_by', true)->whereDate('created_at', $period->time())->first();
    }

    public function requests(PeriodEnum $period = PeriodEnum::TODAY)
    {
        $exchangeRequests = ExchangeRequest::with('creator:id,username,name,phone')->whereIn('type', [
            TransactionTypeEnum::DEPOSIT,
            TransactionTypeEnum::WITHDRAW,
            TransactionTypeEnum::WITHDRAW_LOSING_MONEY,
            TransactionTypeEnum::WITHDRAW_ROLLING_MONEY,
        ])->filterByAgentRole('created_by', true)->whereDate('created_at', $period->time())->get()->map(fn ($record) => (object) [
            'username' => $record->creator?->username,
            'name' => $record->creator?->name,
            'account_holder' => $record->bank && isset($record->bank['account_holder']) ? $record->bank['account_holder'] : null,
            'phone' => $record->creator?->phone,
            'type' => $record->type?->soundType(),
            'type_enum' => $record->type?->soundType()?->name,
            'status' => $record->status?->label(),
            'status_enum' => $record->status?->name,
            'created_at' => $record->created_at,
        ]);

        $membersipRequests = User::with('bank_account')
            ->filterMembersByAgentRole()
            ->where('type', UserTypeEnum::USER)
            ->whereDate('created_at', $period->time())->get()->map(fn ($record) => (object) [
                'username' => $record->username,
                'name' => $record->name,
                'account_holder' => $record->bank_account?->account_holder,
                'phone' => $record->phone,
                'type' => SoundSettingsTypeEnum::MEMBERSHIP_REQUEST?->label(),
                'type_enum' => SoundSettingsTypeEnum::MEMBERSHIP_REQUEST?->name,
                'status' => $record->status?->label(),
                'status_enum' => $record->status?->name,
                'created_at' => $record->created_at,
            ]);

        $customerInquiries = CustomerInquiry::with('creator:id,username,name,phone', 'creator.bank_account')
            ->filterByAgentRole('created_by', true)
            ->whereDate('created_at', $period->time())->get()->map(fn ($record) => (object) [
                'username' => $record->creator?->username,
                'name' => $record->creator?->name,
                'account_holder' => $record->creator?->bank_account?->account_holder,
                'phone' => $record->creator?->phone,
                'type' => SoundSettingsTypeEnum::CUSTOMER_INQUIRY?->label(),
                'type_enum' => SoundSettingsTypeEnum::CUSTOMER_INQUIRY?->name,
                'status' => $record->status?->label(),
                'status_enum' => $record->status?->name,
                'created_at' => $record->created_at,
            ]);

        $c = collect([
            ...$exchangeRequests,
            ...$membersipRequests,
            ...$customerInquiries,
        ])->sortByDesc('created_at')->values();

        return $this->success($c);
    }

    public function activities(PeriodEnum $period = PeriodEnum::TODAY)
    {
        $records = Activity::when(Utils::isAgent(), function ($q) {
            $q->where('causer_id', Utils::getMyChildrenIds());
        })->with('causer')->has('causer')->whereDate('created_at', $period->time())->latest('id')->get();

        return ActivityResource::collection($records);
    }

    public function calculations()
    {
        $totalDeposited = (float) Transaction::deposited()->filterByAgentRole()->sum('money');
        $totalWithdrawals = (float) Transaction::withdrawal()->filterByAgentRole()->sum('money');

        $totalBet = Transaction::bet()->filterByAgentRole()->sum('money') - Transaction::refund()->filterByAgentRole()->sum('money');
        $totalWin = Transaction::win()->filterByAgentRole()->sum('money') - Transaction::cancel()->filterByAgentRole()->sum('money');

        $totalBetToday = Transaction::today()->bet()->filterByAgentRole()->sum('money') - Transaction::today()->refund()->filterByAgentRole()->sum('money');
        $totalWinToday = Transaction::today()->win()->filterByAgentRole()->sum('money') - Transaction::today()->cancel()->filterByAgentRole()->sum('money');

        return $this->success([
            // 'my_balance' => (new AntechipService)->getMyBalance(),
            'total_deposit' => $totalDeposited,
            'total_withdrawal' => $totalWithdrawals,
            'total_difference' => (float) $totalDeposited - $totalWithdrawals,
            'total_betting' => (float) $totalBet,
            'betting_winning' => (float) $totalWin,
            'betting_profit' => (float) $totalWin - $totalBet,
            'total_holding_money' => (float) UserWallet::filterByAgentRole()->sum('holding_money'),
            'total_rolling_money' => (float) UserWallet::filterByAgentRole()->sum('rolling_money'),
            'total_points' => (float) UserWallet::filterByAgentRole()->sum('points'),
            'total_coupon_points' => (float) UserWallet::filterByAgentRole()->sum('coupon_points'),
            'total_losing_money' => (float) UserWallet::filterByAgentRole()->sum('losing_money'),
            'total_members' => (int) User::filterByAgentRole('id')->approved()->member()->count(),
            'total_blacklisted_members' => (int) User::filterByAgentRole('id')->blocked()->count(),
            'betting_today' => (float) $totalBetToday,
            'winning_today' => (float) $totalWinToday,
            'betting_profit_today' => (float) $totalWinToday - $totalBetToday,
            'betting_users_today' => (float) Transaction::filterByAgentRole()->today()->bet()->distinct('user_id')->count(),
            'new_members_today' => (int) User::filterByAgentRole('id')->member()->today()->count(),
            'current_visitors' => (int) AuthenticationLog::filterByAgentRole('authenticatable_id')->current()->distinct('authenticatable_id')->count(),
        ]);
    }

    public function userCalculations(?int $userId = null)
    {
        $userId = $userId ?: auth()->id();
        $user = User::findOrFail($userId);

        if (Utils::isAgent() && ! in_array($user->id, Utils::getMyChildrenIds())) {
            return $this->forbidden();
        }

        $totalDeposited = (float) Transaction::whereBelongsTo($user)->deposited()->sum('money');
        $totalWithdrawals = (float) Transaction::whereBelongsTo($user)->withdrawal()->sum('money');

        $totalBet = Transaction::whereBelongsTo($user)->bet()->sum('money') - Transaction::whereBelongsTo($user)->refund()->sum('money');
        $totalWin = Transaction::whereBelongsTo($user)->win()->sum('money') - Transaction::whereBelongsTo($user)->cancel()->sum('money');

        $totalBetToday = Transaction::whereBelongsTo($user)->today()->bet()->sum('money') - Transaction::whereBelongsTo($user)->today()->refund()->sum('money');
        $totalWinToday = Transaction::whereBelongsTo($user)->today()->win()->sum('money') - Transaction::whereBelongsTo($user)->today()->cancel()->sum('money');

        return $this->success([
            'total_deposit' => $totalDeposited,
            'total_withdrawal' => $totalWithdrawals,
            'total_difference' => (float) $totalDeposited - $totalWithdrawals,
            'total_betting' => (float) $totalBet,
            'betting_winning' => (float) $totalWin,
            'betting_profit' => (float) $totalWin - $totalBet,
            'total_holding_money' => (float) UserWallet::whereBelongsTo($user)->sum('holding_money'),
            'total_rolling_money' => (float) UserWallet::whereBelongsTo($user)->sum('rolling_money'),
            'total_points' => (float) UserWallet::whereBelongsTo($user)->sum('points'),
            'total_coupon_points' => (float) UserWallet::whereBelongsTo($user)->sum('coupon_points'),
            'total_losing_money' => (float) UserWallet::whereBelongsTo($user)->sum('losing_money'),
            'total_members' => (int) User::whereId($user->id)->approved()->member()->count(),
            'total_blacklisted_members' => (int) User::whereId($user->id)->blocked()->count(),
            'betting_today' => (float) $totalBetToday,
            'winning_today' => (float) $totalWinToday,
            'betting_profit_today' => (float) $totalWinToday - $totalBetToday,
            'betting_users_today' => (float) Transaction::whereBelongsTo($user)->today()->bet()->distinct('user_id')->count(),
            'new_members_today' => (int) User::whereId($user->id)->member()->today()->count(),
            'current_visitors' => (int) AuthenticationLog::where('authenticatable_id', $user->id)->current()->distinct('authenticatable_id')->count(),
        ]);
    }
}
