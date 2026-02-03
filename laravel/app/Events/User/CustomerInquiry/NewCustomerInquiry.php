<?php

namespace App\Events\User\CustomerInquiry;

use App\Enums\SoundSettings\SoundSettingsTypeEnum;
use App\Events\BaseEvent;
use App\Http\Resources\v1\SoundSettings\SoundSettingResource;
use App\Models\CustomerInquiry;
use App\Models\User;
use App\Utils\Services\Utils;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Queue\Attributes\WithoutRelations;

class NewCustomerInquiry extends BaseEvent
{
    /**
     * Create a new event instance.
     */
    public function __construct(
        #[WithoutRelations] public CustomerInquiry $customerInquiry
    ) {}

    public function castTo(): Collection|User|array|null
    {
        return $this->castToAdminsAndParents($this->customerInquiry?->creator);
    }

    public function broadcastWith(): array
    {
        $sound = Utils::getSoundSetting(SoundSettingsTypeEnum::CUSTOMER_INQUIRY);

        return [
            'record' => $this->customerInquiry,
            'sound' => $sound ? new SoundSettingResource($sound) : null,
        ];
    }
}
