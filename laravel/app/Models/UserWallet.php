<?php

namespace App\Models;

use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionSourceEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Events\General\User\CouponPointsCredited;
use App\Events\General\User\CouponPointsDebited;
use App\Events\General\User\CouponPointsExchanged;
use App\Events\General\User\LosingMoneyCredited;
use App\Events\General\User\LosingMoneyDebited;
use App\Events\General\User\LosingMoneyWithdrawal;
use App\Events\General\User\MoneyDeposited;
use App\Events\General\User\MoneyWithdrawal;
use App\Events\General\User\PointsCredited;
use App\Events\General\User\PointsDebited;
use App\Events\General\User\PointsExchanged;
use App\Events\General\User\RollingMoneyCredited;
use App\Events\General\User\RollingMoneyWithdrawal;
use App\Observers\UserWalletObserver;
use App\Utils\Services\Utils;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;

#[ObservedBy([UserWalletObserver::class])]
class UserWallet extends BaseModel
{
    protected $fillable = [
        'holding_money',
        'points',
        'points_credited_by_admin',
        'points_credited_by_admin_count',
        'points_credited_by_referal_code',
        'points_credited_by_referal_code_count',
        'points_credited_by_losing_bet',
        'points_credited_by_losing_bet_count',
        'promotion_points',
        'promotion_points_count',
        'points_debited_by_admin',
        'points_debited_by_admin_count',
        'points_exchange',
        'points_exchange_count',
        'coupon_points',
        'coupon_points_credited_by_admin',
        'coupon_points_credited_by_admin_count',
        'coupon_points_debited_by_admin',
        'coupon_points_debited_by_admin_count',
        'coupon_points_credited_by_agent',
        'coupon_points_credited_by_agent_count',
        'coupon_points_debited_by_agent',
        'coupon_points_debited_by_agent_count',
        'coupon_points_exchange',
        'coupon_points_exchange_count',
        'deposited_money',
        'deposited_money_count',
        'deposited_money_by_admin',
        'deposited_money_by_admin_count',
        'withdrawal_money',
        'withdrawal_money_count',
        'withdrawal_money_by_admin',
        'withdrawal_money_by_admin_count',
        'total_holding_money',
        'total_points',
        'total_coupon_points',
        'total_losing_money',
        'total_rolling_money',
        'total_betting_money',
        'total_betting_amount_slot',
        'total_betting_amount_casino',
        'total_refunded_money',
        'total_refunded_amount_slot',
        'total_refunded_amount_casino',
        'total_net_betting_money',
        'total_net_betting_amount_slot',
        'total_net_betting_amount_casino',
        'total_winning_money',
        'total_winning_amount_slot',
        'total_winning_amount_casino',
        'total_canceled_money',
        'total_canceled_amount_slot',
        'total_canceled_amount_casino',
        'total_net_winning_money',
        'total_net_winning_amount_slot',
        'total_net_winning_amount_casino',
        'total_betting_difference',
        'total_betting_difference_slot',
        'total_betting_difference_casino',
        'total_net_betting_difference',
        'total_net_betting_difference_slot',
        'total_net_betting_difference_casino',
        'total_jackpot_money',
        'total_bonus_money',
        'total_promo_win_money',
        'last_deposited_money_at',
        'last_deposited_money_by_admin_at',
        'last_withdrawal_money_at',
        'last_withdrawal_money_by_admin_at',
        'last_points_exchanged_at',
        'last_coupon_points_exchanged_at',
        'last_points_credited_by_admin_at',
        'last_points_credited_by_referal_code_at',
        'last_points_credited_by_losing_bet_at',
        'last_promotion_points_at',
        'last_points_debited_by_admin_at',
        'last_coupon_points_credited_by_admin_at',
        'last_coupon_points_debited_by_admin_at',
        'last_coupon_points_credited_by_agent_at',
        'last_coupon_points_debited_by_agent_at',
        'rolling_money',
        'rolling_money_credited',
        'rolling_money_credited_count',
        'last_rolling_money_credited_at',
        'rolling_money_withdrawal',
        'rolling_money_withdrawal_count',
        'last_rolling_money_withdrawal_at',
        'losing_money',
        'losing_money_credited',
        'losing_money_credited_count',
        'last_losing_money_credited_at',
        'losing_money_debited',
        'losing_money_debited_count',
        'last_losing_money_debited_at',
        'losing_money_withdrawal',
        'losing_money_withdrawal_count',
        'last_losing_money_withdrawal_at',
    ];

    protected $casts = [
        'holding_money' => 'float',
        'points' => 'float',
        'points_credited_by_admin' => 'float',
        'points_credited_by_admin_count' => 'int',
        'points_credited_by_referal_code' => 'float',
        'points_credited_by_referal_code_count' => 'int',
        'points_credited_by_losing_bet' => 'float',
        'points_credited_by_losing_bet_count' => 'int',
        'promotion_points' => 'float',
        'promotion_points_count' => 'int',
        'points_debited_by_admin' => 'float',
        'points_debited_by_admin_count' => 'int',
        'points_exchange' => 'float',
        'points_exchange_count' => 'int',
        'coupon_points' => 'float',
        'coupon_points_credited_by_admin' => 'float',
        'coupon_points_credited_by_admin_count' => 'int',
        'coupon_points_debited_by_admin' => 'float',
        'coupon_points_debited_by_admin_count' => 'int',
        'coupon_points_credited_by_agent' => 'float',
        'coupon_points_credited_by_agent_count' => 'int',
        'coupon_points_debited_by_agent' => 'float',
        'coupon_points_debited_by_agent_count' => 'int',
        'coupon_points_exchange' => 'float',
        'coupon_points_exchange_count' => 'int',
        'deposited_money' => 'float',
        'deposited_money_count' => 'int',
        'deposited_money_by_admin' => 'float',
        'deposited_money_by_admin_count' => 'int',
        'withdrawal_money' => 'float',
        'withdrawal_money_count' => 'int',
        'withdrawal_money_by_admin' => 'float',
        'withdrawal_money_by_admin_count' => 'int',
        'total_holding_money' => 'float',
        'total_points' => 'float',
        'total_coupon_points' => 'float',
        'total_losing_money' => 'float',
        'total_rolling_money' => 'float',
        'total_betting_money' => 'float',
        'total_betting_amount_slot' => 'float',
        'total_betting_amount_casino' => 'float',
        'total_refunded_money' => 'float',
        'total_refunded_amount_slot' => 'float',
        'total_refunded_amount_casino' => 'float',
        'total_net_betting_money' => 'float',
        'total_net_betting_amount_slot' => 'float',
        'total_net_betting_amount_casino' => 'float',
        'total_winning_money' => 'float',
        'total_winning_amount_slot' => 'float',
        'total_winning_amount_casino' => 'float',
        'total_canceled_money' => 'float',
        'total_canceled_amount_slot' => 'float',
        'total_canceled_amount_casino' => 'float',
        'total_net_winning_money' => 'float',
        'total_net_winning_amount_slot' => 'float',
        'total_net_winning_amount_casino' => 'float',
        'total_betting_difference' => 'float',
        'total_betting_difference_slot' => 'float',
        'total_betting_difference_casino' => 'float',
        'total_net_betting_difference' => 'float',
        'total_net_betting_difference_slot' => 'float',
        'total_net_betting_difference_casino' => 'float',
        'total_jackpot_money' => 'float',
        'total_bonus_money' => 'float',
        'total_promo_win_money' => 'float',
        'last_deposited_money_at' => 'datetime',
        'last_deposited_money_by_admin_at' => 'datetime',
        'last_withdrawal_money_at' => 'datetime',
        'last_withdrawal_money_by_admin_at' => 'datetime',
        'last_points_exchanged_at' => 'datetime',
        'last_coupon_points_exchanged_at' => 'datetime',
        'last_points_credited_by_admin_at' => 'datetime',
        'last_points_credited_by_referal_code_at' => 'datetime',
        'last_points_credited_by_losing_bet_at' => 'datetime',
        'last_promotion_points_at' => 'datetime',
        'last_points_debited_by_admin_at' => 'datetime',
        'last_coupon_points_credited_by_admin_at' => 'datetime',
        'last_coupon_points_debited_by_admin_at' => 'datetime',
        'last_coupon_points_credited_by_agent_at' => 'datetime',
        'last_coupon_points_debited_by_agent_at' => 'datetime',
        'rolling_money' => 'float',
        'rolling_money_credited' => 'float',
        'rolling_money_credited_count' => 'int',
        'last_rolling_money_credited_at' => 'datetime',
        'rolling_money_withdrawal' => 'float',
        'rolling_money_withdrawal_count' => 'int',
        'last_rolling_money_withdrawal_at' => 'datetime',
        'losing_money' => 'float',
        'losing_money_credited' => 'float',
        'losing_money_credited_count' => 'int',
        'last_losing_money_credited_at' => 'datetime',
        'losing_money_debited' => 'float',
        'losing_money_debited_count' => 'int',
        'last_losing_money_debited_at' => 'datetime',
        'losing_money_withdrawal' => 'float',
        'losing_money_withdrawal_count' => 'int',
        'last_losing_money_withdrawal_at' => 'datetime',
    ];

    public function deposit(Transaction $transaction)
    {
        $data = [];
        if ($transaction->type === TransactionTypeEnum::MONEY_CREDITED) {
            if ($transaction->category === TransactionCategoryEnum::ADMINISTRATOR_MANUAL_PAYMENT) {
                $data = [
                    'deposited_money_by_admin' => $this->deposited_money_by_admin + $transaction->money,
                    'deposited_money_by_admin_count' => $this->deposited_money_by_admin_count + 1,
                    'last_deposited_money_by_admin_at' => $transaction->created_at,
                ];
            } elseif ($transaction->category === TransactionCategoryEnum::GAME_BET_WIN_MONEY) {
                $total_winning_money = $this->total_winning_money + $transaction->money;
                $total_net_winning_money = $total_winning_money - $this->total_canceled_money;
                $data = [
                    'total_winning_money' => $total_winning_money,
                    'total_net_winning_money' => $total_net_winning_money,
                    'total_betting_difference' => $total_winning_money - $this->total_betting_money,
                    'total_net_betting_difference' => $total_net_winning_money - $this->total_net_betting_money,
                ];

                // Track slot and casino winning amounts
                $gameType = $this->getGameType($transaction);
                if ($gameType === 'slot') {
                    $total_winning_amount_slot = $this->total_winning_amount_slot + $transaction->money;
                    $total_net_winning_amount_slot = $total_winning_amount_slot - $this->total_canceled_amount_slot;
                    $data['total_winning_amount_slot'] = $total_winning_amount_slot;
                    $data['total_net_winning_amount_slot'] = $total_net_winning_amount_slot;
                    $data['total_betting_difference_slot'] = $total_winning_amount_slot - $this->total_betting_amount_slot;
                    $data['total_net_betting_difference_slot'] = $total_net_winning_amount_slot - $this->total_net_betting_amount_slot;
                } elseif ($gameType === 'casino') {
                    $total_winning_amount_casino = $this->total_winning_amount_casino + $transaction->money;
                    $total_net_winning_amount_casino = $total_winning_amount_casino - $this->total_canceled_amount_casino;
                    $data['total_winning_amount_casino'] = $total_winning_amount_casino;
                    $data['total_net_winning_amount_casino'] = $total_net_winning_amount_casino;
                    $data['total_betting_difference_casino'] = $total_winning_amount_casino - $this->total_betting_amount_casino;
                    $data['total_net_betting_difference_casino'] = $total_net_winning_amount_casino - $this->total_net_betting_amount_casino;
                }
            } elseif ($transaction->category === TransactionCategoryEnum::GAME_REFUNDED_MONEY) {
                $total_refunded_money = $this->total_refunded_money + $transaction->money;
                $total_net_betting_money = $this->total_betting_money - $total_refunded_money;
                $data = [
                    'total_refunded_money' => $total_refunded_money,
                    'total_net_betting_money' => $total_net_betting_money,
                    'total_betting_difference' => $this->total_winning_money - $this->total_betting_money,
                    'total_net_betting_difference' => $this->total_net_winning_money - $total_net_betting_money,
                ];

                // Track slot and casino refunded amounts
                $gameType = $this->getGameType($transaction);
                if ($gameType === 'slot') {
                    $total_refunded_amount_slot = $this->total_refunded_amount_slot + $transaction->money;
                    $total_net_betting_amount_slot = $this->total_betting_amount_slot - $total_refunded_amount_slot;
                    $data['total_refunded_amount_slot'] = $total_refunded_amount_slot;
                    $data['total_net_betting_amount_slot'] = $total_net_betting_amount_slot;
                    $data['total_betting_difference_slot'] = $this->total_winning_amount_slot - $this->total_betting_amount_slot;
                    $data['total_net_betting_difference_slot'] = $this->total_net_winning_amount_slot - $total_net_betting_amount_slot;
                } elseif ($gameType === 'casino') {
                    $total_refunded_amount_casino = $this->total_refunded_amount_casino + $transaction->money;
                    $total_net_betting_amount_casino = $this->total_betting_amount_casino - $total_refunded_amount_casino;
                    $data['total_refunded_amount_casino'] = $total_refunded_amount_casino;
                    $data['total_net_betting_amount_casino'] = $total_net_betting_amount_casino;
                    $data['total_betting_difference_casino'] = $this->total_winning_amount_casino - $this->total_betting_amount_casino;
                    $data['total_net_betting_difference_casino'] = $this->total_net_winning_amount_casino - $total_net_betting_amount_casino;
                }
            } elseif ($transaction->category === TransactionCategoryEnum::GAME_JACKPOT_MONEY) {
                $data = [
                    'total_jackpot_money' => $this->total_jackpot_money + $transaction->money,
                ];
            } elseif ($transaction->category === TransactionCategoryEnum::GAME_BONUS_MONEY) {
                $data = [
                    'total_bonus_money' => $this->total_bonus_money + $transaction->money,
                ];
            } elseif ($transaction->category === TransactionCategoryEnum::GAME_PROMO_WIN_MONEY) {
                $data = [
                    'total_promo_win_money' => $this->total_promo_win_money + $transaction->money,
                ];
            }
        } else {
            $data = [
                'deposited_money' => $this->deposited_money + $transaction->money,
                'deposited_money_count' => $this->deposited_money_count + 1,
                'last_deposited_money_at' => $transaction->created_at,
            ];
        }

        return $this->update([
            'holding_money' => $transaction->after_money,
            'total_holding_money' => $this->total_holding_money + $transaction->money,
            ...$data,
        ]);
    }

    /**
     * Determine if a transaction is for a slot or casino game.
     * Returns 'slot', 'casino', or null if game is not found or cannot be determined.
     */
    private function getGameType(?Transaction $transaction): ?string
    {
        if (! $transaction || ! $transaction->game_id) {
            return null;
        }

        $game = $transaction->game;
        if (! $game) {
            return null;
        }

        if ($game->is_slot_game) {
            return 'slot';
        }

        if ($game->is_live_game) {
            return 'casino';
        }

        return null;
    }

    public function withdraw(Transaction $transaction)
    {
        $data = [];
        if ($transaction->type === TransactionTypeEnum::MONEY_DEBITED) {
            if ($transaction->category === TransactionCategoryEnum::ADMINISTRATOR_MANUAL_RECOVERY) {
                $data = [
                    'withdrawal_money_by_admin' => $this->withdrawal_money_by_admin + $transaction->money,
                    'withdrawal_money_by_admin_count' => $this->withdrawal_money_by_admin_count + 1,
                    'last_withdrawal_money_by_admin_at' => $transaction->created_at,
                ];
            } elseif ($transaction->category === TransactionCategoryEnum::GAME_BET_MONEY) {
                $total_betting_money = $this->total_betting_money + $transaction->money;
                $total_net_betting_money = $total_betting_money - $this->total_refunded_money;
                $data = [
                    'total_betting_money' => $total_betting_money,
                    'total_net_betting_money' => $total_net_betting_money,
                    'total_betting_difference' => $this->total_winning_money - $total_betting_money,
                    'total_net_betting_difference' => $this->total_net_winning_money - $total_net_betting_money,
                ];

                // Track slot and casino betting amounts
                $gameType = $this->getGameType($transaction);
                if ($gameType === 'slot') {
                    $total_betting_amount_slot = $this->total_betting_amount_slot + $transaction->money;
                    $total_net_betting_amount_slot = $total_betting_amount_slot - $this->total_refunded_amount_slot;
                    $data['total_betting_amount_slot'] = $total_betting_amount_slot;
                    $data['total_net_betting_amount_slot'] = $total_net_betting_amount_slot;
                    $data['total_betting_difference_slot'] = $this->total_winning_amount_slot - $total_betting_amount_slot;
                    $data['total_net_betting_difference_slot'] = $this->total_net_winning_amount_slot - $total_net_betting_amount_slot;
                } elseif ($gameType === 'casino') {
                    $total_betting_amount_casino = $this->total_betting_amount_casino + $transaction->money;
                    $total_net_betting_amount_casino = $total_betting_amount_casino - $this->total_refunded_amount_casino;
                    $data['total_betting_amount_casino'] = $total_betting_amount_casino;
                    $data['total_net_betting_amount_casino'] = $total_net_betting_amount_casino;
                    $data['total_betting_difference_casino'] = $this->total_winning_amount_casino - $total_betting_amount_casino;
                    $data['total_net_betting_difference_casino'] = $this->total_net_winning_amount_casino - $total_net_betting_amount_casino;
                }
            } elseif ($transaction->category === TransactionCategoryEnum::GAME_CANCELED_MONEY) {
                $total_canceled_money = $this->total_canceled_money + $transaction->money;
                $total_net_winning_money = $this->total_winning_money - $total_canceled_money;
                $data = [
                    'total_canceled_money' => $total_canceled_money,
                    'total_net_winning_money' => $total_net_winning_money,
                    'total_betting_difference' => $this->total_winning_money - $this->total_betting_money,
                    'total_net_betting_difference' => $total_net_winning_money - $this->total_net_betting_money,
                ];

                // Track slot and casino canceled amounts
                $gameType = $this->getGameType($transaction);
                if ($gameType === 'slot') {
                    $total_canceled_amount_slot = $this->total_canceled_amount_slot + $transaction->money;
                    $total_net_winning_amount_slot = $this->total_winning_amount_slot - $total_canceled_amount_slot;
                    $data['total_canceled_amount_slot'] = $total_canceled_amount_slot;
                    $data['total_net_winning_amount_slot'] = $total_net_winning_amount_slot;
                    $data['total_betting_difference_slot'] = $this->total_winning_amount_slot - $this->total_betting_amount_slot;
                    $data['total_net_betting_difference_slot'] = $total_net_winning_amount_slot - $this->total_net_betting_amount_slot;
                } elseif ($gameType === 'casino') {
                    $total_canceled_amount_casino = $this->total_canceled_amount_casino + $transaction->money;
                    $total_net_winning_amount_casino = $this->total_winning_amount_casino - $total_canceled_amount_casino;
                    $data['total_canceled_amount_casino'] = $total_canceled_amount_casino;
                    $data['total_net_winning_amount_casino'] = $total_net_winning_amount_casino;
                    $data['total_betting_difference_casino'] = $this->total_winning_amount_casino - $this->total_betting_amount_casino;
                    $data['total_net_betting_difference_casino'] = $total_net_winning_amount_casino - $this->total_net_betting_amount_casino;
                }
            }
        } else {
            $data = [
                'withdrawal_money' => $this->withdrawal_money + $transaction->money,
                'withdrawal_money_count' => $this->withdrawal_money_count + 1,
                'last_withdrawal_money_at' => $transaction->created_at,
            ];
        }

        return $this->update([
            'holding_money' => $transaction->after_money,
            ...$data,
        ]);
    }

    public function exchangePoints(Transaction $transaction)
    {
        return $this->update([
            'holding_money' => $this->holding_money + Utils::calculateMoneyAgainstPoints($transaction->money),
            'points' => $transaction->after_money,
            'points_exchange' => $this->points_exchange + $transaction->money,
            'points_exchange_count' => $this->points_exchange_count + 1,
            'last_points_exchanged_at' => $transaction->created_at,
        ]);
    }

    public function exchangeCouponPoints(Transaction $transaction)
    {
        return $this->update([
            'holding_money' => $this->holding_money + Utils::calculateMoneyAgainstPoints($transaction->money),
            'coupon_points' => $transaction->after_money,
            'coupon_points_exchange' => $this->coupon_points_exchange + $transaction->money,
            'coupon_points_exchange_count' => $this->coupon_points_exchange_count + 1,
            'last_coupon_points_exchanged_at' => $transaction->created_at,
        ]);
    }

    public function creditPoints(Transaction $transaction)
    {
        $data = [
            'points' => $transaction->after_money,
            'total_points' => $this->total_points + $transaction->money,
        ];

        if ($transaction->category === TransactionCategoryEnum::WEEKLY_LOSS_BONUS) {
            $data['points_credited_by_losing_bet'] = $this->points_credited_by_losing_bet + $transaction->money;
            $data['points_credited_by_losing_bet_count'] = $this->points_credited_by_losing_bet_count + 1;
            $data['last_points_credited_by_losing_bet_at'] = $transaction->created_at;
        } elseif ($transaction->category === TransactionCategoryEnum::PROMOTION_POINTS) {
            $data['promotion_points'] = $this->promotion_points + $transaction->money;
            $data['promotion_points_count'] = $this->promotion_points_count + 1;
            $data['last_promotion_points_at'] = $transaction->created_at;
        } elseif ($transaction->source === TransactionSourceEnum::REFFERAL_BONUS) {
            $data['points_credited_by_referal_code'] = $this->points_credited_by_referal_code + $transaction->money;
            $data['points_credited_by_referal_code_count'] = $this->points_credited_by_referal_code_count + 1;
            $data['last_points_credited_by_referal_code_at'] = $transaction->created_at;
        } else {
            $data['points_credited_by_admin'] = $this->points_credited_by_admin + $transaction->money;
            $data['points_credited_by_admin_count'] = $this->points_credited_by_admin_count + 1;
            $data['last_points_credited_by_admin_at'] = $transaction->created_at;
        }

        return $this->update($data);
    }

    public function debitPoints(Transaction $transaction)
    {
        return $this->update([
            'points' => $transaction->after_money,
            'points_debited_by_admin' => $this->points_debited_by_admin + $transaction->money,
            'points_debited_by_admin_count' => $this->points_debited_by_admin_count + 1,
            'last_points_debited_by_admin_at' => $transaction->created_at,
        ]);
    }

    public function creditCouponPoints(Transaction $transaction)
    {
        if ($transaction->category === TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_PAYMENT) {
            return $this->update([
                'coupon_points' => $transaction->after_money,
                'coupon_points_credited_by_agent' => $this->coupon_points_credited_by_agent + $transaction->money,
                'coupon_points_credited_by_agent_count' => $this->coupon_points_credited_by_agent_count + 1,
                'last_coupon_points_credited_by_agent_at' => $transaction->created_at,
                'total_coupon_points' => $this->total_coupon_points + $transaction->money,
            ]);
        }

        return $this->update([
            'coupon_points' => $transaction->after_money,
            'coupon_points_credited_by_admin' => $this->coupon_points_credited_by_admin + $transaction->money,
            'coupon_points_credited_by_admin_count' => $this->coupon_points_credited_by_admin_count + 1,
            'last_coupon_points_credited_by_admin_at' => $transaction->created_at,
            'total_coupon_points' => $this->total_coupon_points + $transaction->money,
        ]);
    }

    public function debitCouponPoints(Transaction $transaction)
    {
        if ($transaction->category === TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_RECOVERY) {
            return $this->update([
                'coupon_points' => $transaction->after_money,
                'coupon_points_debited_by_agent' => $this->coupon_points_debited_by_agent + $transaction->money,
                'coupon_points_debited_by_agent_count' => $this->coupon_points_debited_by_agent_count + 1,
                'last_coupon_points_debited_by_agent_at' => $transaction->created_at,
            ]);
        }

        return $this->update([
            'coupon_points' => $transaction->after_money,
            'coupon_points_debited_by_admin' => $this->coupon_points_debited_by_admin + $transaction->money,
            'coupon_points_debited_by_admin_count' => $this->coupon_points_debited_by_admin_count + 1,
            'last_coupon_points_debited_by_admin_at' => $transaction->created_at,
        ]);
    }

    public function creditRollingMoney(Transaction $transaction)
    {
        return $this->update([
            'rolling_money' => $this->rolling_money + $transaction->money,
            'rolling_money_credited' => $this->rolling_money_credited + $transaction->money,
            'rolling_money_credited_count' => $this->rolling_money_credited_count + 1,
            'last_rolling_money_credited_at' => $transaction->created_at,
            'total_rolling_money' => $this->total_rolling_money + $transaction->money,
        ]);
    }

    public function withdrawRollingMoney(Transaction $transaction)
    {
        return $this->update([
            'rolling_money' => $this->rolling_money - $transaction->money,
            'rolling_money_withdrawal' => $this->rolling_money_withdrawal + $transaction->money,
            'rolling_money_withdrawal_count' => $this->rolling_money_withdrawal_count + 1,
            'last_rolling_money_withdrawal_at' => $transaction->created_at,
        ]);
    }

    public function creditLosingMoney(Transaction $transaction)
    {
        return $this->update([
            'losing_money' => $this->losing_money + $transaction->money,
            'losing_money_credited' => $this->losing_money_credited + $transaction->money,
            'losing_money_credited_count' => $this->losing_money_credited_count + 1,
            'last_losing_money_credited_at' => $transaction->created_at,
            'total_losing_money' => $this->total_losing_money + $transaction->money,
        ]);
    }

    public function debitLosingMoney(Transaction $transaction)
    {
        return $this->update([
            'losing_money' => $this->losing_money - $transaction->money,
            'losing_money_debited' => $this->losing_money_debited + $transaction->money,
            'losing_money_debited_count' => $this->losing_money_debited_count + 1,
            'last_losing_money_debited_at' => $transaction->created_at,
        ]);
    }

    public function withdrawLosingMoney(Transaction $transaction)
    {
        return $this->update([
            'losing_money' => $this->losing_money - $transaction->money,
            'losing_money_withdrawal' => $this->losing_money_withdrawal + $transaction->money,
            'losing_money_withdrawal_count' => $this->losing_money_withdrawal_count + 1,
            'last_losing_money_withdrawal_at' => $transaction->created_at,
        ]);
    }

    public function updateWallet(Transaction $transaction)
    {
        if (in_array($transaction->type, [
            TransactionTypeEnum::DEPOSIT,
            TransactionTypeEnum::MONEY_CREDITED,
        ])) {
            $this->deposit($transaction);

            MoneyDeposited::dispatch($this);

            return $this;
        }

        if (in_array($transaction->type, [
            TransactionTypeEnum::WITHDRAW,
            TransactionTypeEnum::MONEY_DEBITED,
        ])) {
            $this->withdraw($transaction);

            MoneyWithdrawal::dispatch($this);

            return $this;
        }

        if ($transaction->type === TransactionTypeEnum::POINTS_CREDITED) {
            $this->creditPoints($transaction);

            PointsCredited::dispatch($this);

            return $this;
        }

        if ($transaction->type === TransactionTypeEnum::POINTS_DEBITED) {
            $this->debitPoints($transaction);

            PointsDebited::dispatch($this);

            return $this;
        }

        if ($transaction->type === TransactionTypeEnum::COUPON_POINTS_CREDITED) {
            $this->creditCouponPoints($transaction);

            CouponPointsCredited::dispatch($this);

            return $this;
        }

        if ($transaction->type === TransactionTypeEnum::COUPON_POINTS_DEBITED) {
            $this->debitCouponPoints($transaction);

            CouponPointsDebited::dispatch($this);

            return $this;
        }

        if ($transaction->type === TransactionTypeEnum::POINTS_EXCHANGE) {
            $this->exchangePoints($transaction);

            PointsExchanged::dispatch($this);

            return $this;
        }

        if ($transaction->type === TransactionTypeEnum::COUPON_POINTS_EXCHANGE) {
            $this->exchangeCouponPoints($transaction);

            CouponPointsExchanged::dispatch($this);

            return $this;
        }

        if ($transaction->type === TransactionTypeEnum::ROLLING_MONEY_CREDITED) {
            $this->creditRollingMoney($transaction);

            RollingMoneyCredited::dispatch($this);

            return $this;
        }

        if ($transaction->type === TransactionTypeEnum::WITHDRAW_ROLLING_MONEY) {
            $this->withdrawRollingMoney($transaction);

            RollingMoneyWithdrawal::dispatch($this);

            return $this;
        }

        if ($transaction->type === TransactionTypeEnum::LOSING_MONEY_CREDITED) {
            $this->creditLosingMoney($transaction);

            LosingMoneyCredited::dispatch($this);

            return $this;
        }

        if ($transaction->type === TransactionTypeEnum::LOSING_MONEY_DEBITED) {
            $this->debitLosingMoney($transaction);

            LosingMoneyDebited::dispatch($this);

            return $this;
        }

        if ($transaction->type === TransactionTypeEnum::WITHDRAW_LOSING_MONEY) {
            $this->withdrawLosingMoney($transaction);

            LosingMoneyWithdrawal::dispatch($this);

            return $this;
        }

        return $this;
    }
}
