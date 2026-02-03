<?php

namespace App\Http\Resources\v1\Stats\Requests;

use App\Enums\SoundSettings\SoundSettingsTypeEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequestsCounterResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            SoundSettingsTypeEnum::RECHARGE_REQUEST->value => [
                'unprocessed_count' => $this->get('exchange_requests')?->deposit_unprocessed_count ?: 0,
                'processed_count' => $this->get('exchange_requests')?->deposit_processed_count ?: 0,
            ],
            SoundSettingsTypeEnum::WITHDRAW_REQUEST->value => [
                'unprocessed_count' => $this->get('exchange_requests')?->withdraw_unprocessed_count ?: 0,
                'processed_count' => $this->get('exchange_requests')?->withdraw_processed_count ?: 0,
            ],
            SoundSettingsTypeEnum::WITHDRAW_ROLLING_MONEY->value => [
                'unprocessed_count' => $this->get('exchange_requests')?->withdraw_rolling_money_unprocessed_count ?: 0,
                'processed_count' => $this->get('exchange_requests')?->withdraw_rolling_money_processed_count ?: 0,
            ],
            SoundSettingsTypeEnum::WITHDRAW_LOSING_MONEY->value => [
                'unprocessed_count' => $this->get('exchange_requests')?->withdraw_losing_money_unprocessed_count ?: 0,
                'processed_count' => $this->get('exchange_requests')?->withdraw_losing_money_processed_count ?: 0,
            ],
            SoundSettingsTypeEnum::MEMBERSHIP_REQUEST->value => [
                'unprocessed_count' => $this->get('membership_requests')?->unprocessed_count ?: 0,
                'processed_count' => $this->get('membership_requests')?->processed_count ?: 0,
            ],
            SoundSettingsTypeEnum::CUSTOMER_INQUIRY->value => [
                'unprocessed_count' => $this->get('customer_inquiries')?->unprocessed_count ?: 0,
                'processed_count' => $this->get('customer_inquiries')?->processed_count ?: 0,
            ],
        ];
    }
}
