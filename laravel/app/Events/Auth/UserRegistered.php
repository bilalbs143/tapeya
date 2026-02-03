<?php

namespace App\Events\Auth;

use App\Enums\SoundSettings\SoundSettingsTypeEnum;
use App\Events\BaseEvent;
use App\Http\Resources\v1\SoundSettings\SoundSettingResource;
use App\Models\User;
use App\Utils\Services\Utils;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Queue\Attributes\WithoutRelations;

class UserRegistered extends BaseEvent
{
    /**
     * Create a new event instance.
     */
    public function __construct(
        #[WithoutRelations] public User $user
    ) {}

    public function castTo(): Collection|User|array|null
    {
        return $this->castToAdminsAndParents($this->user);
    }

    public function broadcastWith(): array
    {
        $sound = Utils::getSoundSetting(SoundSettingsTypeEnum::MEMBERSHIP_REQUEST);

        return [
            'record' => $this->user,
            'sound' => $sound ? new SoundSettingResource($sound) : null,
        ];
    }
}
