<?php

namespace App\Events\User\ExchangeRequest;

use App\Enums\SoundSettings\SoundSettingsTypeEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Events\BaseEvent;
use App\Http\Resources\v1\SoundSettings\SoundSettingResource;
use App\Models\ExchangeRequest;
use App\Models\User;
use App\Utils\Services\Utils;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Queue\Attributes\WithoutRelations;

class NewExchangeRequest extends BaseEvent
{
    /**
     * Create a new event instance.
     */
    public function __construct(
        #[WithoutRelations] public ExchangeRequest $exchangeRequest
    ) {}

    public function castTo(): Collection|User|array|null
    {
        return $this->castToAdminsAndParents($this->exchangeRequest?->creator);
    }

    public function broadcastWith(): array
    {
        $type = null;
        if ($this->exchangeRequest->type === TransactionTypeEnum::DEPOSIT) {
            $type = SoundSettingsTypeEnum::RECHARGE_REQUEST;
        } elseif ($this->exchangeRequest->type === TransactionTypeEnum::WITHDRAW) {
            $type = SoundSettingsTypeEnum::WITHDRAW_REQUEST;
        } elseif ($this->exchangeRequest->type === TransactionTypeEnum::WITHDRAW_ROLLING_MONEY) {
            $type = SoundSettingsTypeEnum::WITHDRAW_ROLLING_MONEY;
        } elseif ($this->exchangeRequest->type === TransactionTypeEnum::WITHDRAW_LOSING_MONEY) {
            $type = SoundSettingsTypeEnum::WITHDRAW_LOSING_MONEY;
        }

        $sound = Utils::getSoundSetting($type);

        return [
            'record' => $this->exchangeRequest,
            'sound' => $sound ? new SoundSettingResource($sound) : null,
        ];
    }
}
