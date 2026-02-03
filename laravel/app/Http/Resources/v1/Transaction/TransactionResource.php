<?php

namespace App\Http\Resources\v1\Transaction;

use App\Http\Resources\v1\GameResultCard\GameResultCardResource;
use App\Http\Resources\v1\User\Operator\OperatorResource;
use App\Utils\Services\Utils;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transaction_number' => $this->transaction_number,
            'txn_id' => $this->txn_id,
            'transaction_result_id' => $this->transaction_result_id,
            'type' => $this->type?->label(),
            'type_enum' => $this->type?->name,
            'sub_type' => $this->sub_type?->label(),
            'sub_type_enum' => $this->sub_type?->name,
            'category' => $this->category?->label(),
            'category_enum' => $this->category?->name,
            'source' => $this->source?->label(),
            'source_enum' => $this->source?->name,
            'amount' => Utils::displayMoney($this->amount, $this->type),
            'user' => new TransactionUserResource($this->user),
            'ip_address' => $this->ip_address,
            // 'exchange_request' => $this->when($this->exchange_request, new TransactionExchangeRequestResource($this->exchange_request)),
            'before_transaction_amount' => $this->before_money,
            'transaction_amount' => $this->money,
            'after_transaction_amount' => $this->after_money,
            'memo' => $this->memo,
            'creator' => new OperatorResource($this->creator),
            'receiver' => $this->receiver ? new OperatorResource($this->receiver) : null,
            'result_cards' => $this->result_cards ? new GameResultCardResource($this->result_cards) : null,
            // 'created_at' => $this->created_at,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
