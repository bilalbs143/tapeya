<?php

namespace App\Http\Resources\v1\TransactionResult;

use App\Enums\GameResultCard\GameResultCardStatusEnum;
use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Enums\TransactionResult\TransactionResultState;
use App\Http\Resources\v1\Game\LimitedGameResource;
use App\Http\Resources\v1\GameResultCard\GameResultCardResource;
use App\Http\Resources\v1\User\LimitedMemberResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResultResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $resultCards = null;
        if ($this->debit_result_cards && $this->debit_result_cards?->status === GameResultCardStatusEnum::RESOLVED) {
            $resultCards = $this->debit_result_cards;
        }

        if (! $resultCards && $this->state === TransactionResultState::WIN && $this->credit_result_cards?->status === GameResultCardStatusEnum::RESOLVED) {
            $resultCards = $this->credit_result_cards;
        }

        if ($resultCards) {
            $resultCards = new GameResultCardResource($resultCards);
        }

        $winAmount = $this->transactions->where('type', TransactionTypeEnum::MONEY_CREDITED)->where('category', TransactionCategoryEnum::GAME_BET_WIN_MONEY)->sum('money');
        $betAmount = $this->transactions->where('type', TransactionTypeEnum::MONEY_DEBITED)->where('category', TransactionCategoryEnum::GAME_BET_MONEY)->sum('money');

        $finalResult = TransactionResultState::getFinalResult($this->resource);

        return [
            'id' => $this->id,
            'state' => $finalResult?->label(),
            'state_enum' => $finalResult?->name,
            'game' => new LimitedGameResource($this->game),
            'bet' => $betAmount,
            'win' => $winAmount,
            'holding_money_before_bet' => $this->before_debit,
            'holding_money_after_bet' => $this->closing_balance,
            'refund_amount' => $this->refund_amount,
            'user' => new LimitedMemberResource($this->user),
            'result_cards' => $resultCards,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    // private function getMoneyAfter()
    // {
    //     return match($this->state) {
    //         TransactionResultState::BET => $this->after_debit,
    //         TransactionResultState::WIN => $this->after_credit,
    //         TransactionResultState::LOSE => $this->after_debit,
    //         TransactionResultState::REFUNDED => $this->after_refund,
    //         TransactionResultState::CANCELED => $this->after_cancel,
    //     };
    // }
}
