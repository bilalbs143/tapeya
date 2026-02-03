<?php

namespace App\Http\Controllers\v1\Admin;

use App\Enums\Transaction\MoneyTypeEnum;
use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionSourceEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Http\Requests\v1\Admin\Transaction\PayRequest;
use App\Http\Resources\v1\Transaction\TransactionResource;
use App\Models\Transaction;
use App\Models\User;
use App\Utils\Services\Utils;
use Exception;

class TransactionController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Transaction::class, TransactionResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'user',
            'creator',
            'exchange_request',
            'receiver',
            'result_cards',
        ])->filterByAgentRole();
    }

    public function getCategories()
    {
        return response()->json([
            'sub_types' => MoneyTypeEnum::withLabels(),
        ]);
    }

    public function pay(PayRequest $request, User $user)
    {
        $data = $request->validated();
        if (! ($user->isAgent() || $user->isMember())) {
            return $this->forbidden();
        }

        try {
            if (Utils::isAgent()) {
                if ($request->has('coupon_points') && $data['coupon_points']) {
                    if (! in_array($user->id, Utils::getMyChildrenIds())) {
                        return $this->forbidden();
                    }
                    $agentCouponPoints = auth()->user()->wallet?->coupon_points ?? 0;

                    if ($data['coupon_points'] > 0 && $data['coupon_points'] > $agentCouponPoints) {
                        return $this->failure('insufficient_coupon_points');
                    }

                    $transactionType = ($data['coupon_points'] > 0) ? TransactionTypeEnum::COUPON_POINTS_CREDITED : TransactionTypeEnum::COUPON_POINTS_DEBITED;
                    $transactionSource = ($data['coupon_points'] > 0) ? TransactionSourceEnum::MANUAL_COUPON_POINTS_PAYMENT : TransactionSourceEnum::MANUAL_COUPON_POINTS_RECOVERY;
                    $transactionCategory = ($data['coupon_points'] > 0) ? TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_PAYMENT : TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_RECOVERY;

                    Transaction::createTransaction(
                        type: $transactionType,
                        amount: abs($data['coupon_points']),
                        moneyType: MoneyTypeEnum::COUPON_POINTS,
                        user: $user,
                        source: $transactionSource,
                        category: $transactionCategory,
                        memo: $data['coupon_points_memo'],
                    );

                    $transactionType = ($data['coupon_points'] > 0) ? TransactionTypeEnum::COUPON_POINTS_DEBITED : TransactionTypeEnum::COUPON_POINTS_CREDITED;
                    $transactionSource = ($data['coupon_points'] > 0) ? TransactionSourceEnum::MANUAL_COUPON_POINTS_PAYMENT : TransactionSourceEnum::MANUAL_COUPON_POINTS_RECOVERY;
                    $transactionCategory = ($data['coupon_points'] > 0) ? TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_DISTRIBUTION_PAYMENT : TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_DISTRIBUTION_RECOVERY;

                    Transaction::createTransaction(
                        type: $transactionType,
                        amount: abs($data['coupon_points']),
                        moneyType: MoneyTypeEnum::COUPON_POINTS,
                        user: auth()->user(),
                        source: $transactionSource,
                        category: $transactionCategory,
                        memo: $data['coupon_points_memo'],
                        givenTo: $user->id,
                    );
                }
            } else {
                if ($request->has('money') && $data['money']) {
                    $transactionType = ($data['money'] > 0) ? TransactionTypeEnum::MONEY_CREDITED : TransactionTypeEnum::MONEY_DEBITED;
                    $transactionSource = ($data['money'] > 0) ? TransactionSourceEnum::MANUAL_PAYMENT : TransactionSourceEnum::MANUAL_RECOVERY;
                    $transactionCategory = ($data['money'] > 0) ? TransactionCategoryEnum::ADMINISTRATOR_MANUAL_PAYMENT : TransactionCategoryEnum::ADMINISTRATOR_MANUAL_RECOVERY;

                    Transaction::createTransaction(
                        type: $transactionType,
                        amount: abs($data['money']),
                        moneyType: MoneyTypeEnum::MONEY,
                        user: $user,
                        source: $transactionSource,
                        category: $transactionCategory,
                        memo: $data['money_memo'],
                    );
                }
                if ($request->has('points') && $data['points']) {
                    $transactionType = ($data['points'] > 0) ? TransactionTypeEnum::POINTS_CREDITED : TransactionTypeEnum::POINTS_DEBITED;
                    $transactionSource = ($data['points'] > 0) ? TransactionSourceEnum::MANUAL_POINTS_PAYMENT : TransactionSourceEnum::MANUAL_POINTS_RECOVERY;
                    $transactionCategory = ($data['points'] > 0) ? TransactionCategoryEnum::ADMINISTRATOR_MANUAL_POINTS_PAYMENT : TransactionCategoryEnum::ADMINISTRATOR_MANUAL_POINTS_RECOVERY;

                    Transaction::createTransaction(
                        type: $transactionType,
                        amount: abs($data['points']),
                        moneyType: MoneyTypeEnum::POINTS,
                        user: $user,
                        source: $transactionSource,
                        category: $transactionCategory,
                        memo: $data['points_memo'],
                    );
                }
                if ($request->has('coupon_points') && $data['coupon_points']) {
                    $transactionType = ($data['coupon_points'] > 0) ? TransactionTypeEnum::COUPON_POINTS_CREDITED : TransactionTypeEnum::COUPON_POINTS_DEBITED;
                    $transactionSource = ($data['coupon_points'] > 0) ? TransactionSourceEnum::MANUAL_COUPON_POINTS_PAYMENT : TransactionSourceEnum::MANUAL_COUPON_POINTS_RECOVERY;
                    $transactionCategory = ($data['coupon_points'] > 0) ? TransactionCategoryEnum::ADMINISTRATOR_MANUAL_COUPON_POINTS_PAYMENT : TransactionCategoryEnum::ADMINISTRATOR_MANUAL_COUPON_POINTS_RECOVERY;

                    Transaction::createTransaction(
                        type: $transactionType,
                        amount: abs($data['coupon_points']),
                        moneyType: MoneyTypeEnum::COUPON_POINTS,
                        user: $user,
                        source: $transactionSource,
                        category: $transactionCategory,
                        memo: $data['coupon_points_memo'],
                    );
                }
            }

            return $this->success(message: 'paid_successfully');
        } catch (Exception $e) {
            return $this->failure($e->getMessage());
        }
    }
}
