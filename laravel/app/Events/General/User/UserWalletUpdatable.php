<?php

namespace App\Events\General\User;

use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Queue\Attributes\WithoutRelations;

trait UserWalletUpdatable
{
    /**
     * Create a new event instance.
     */
    public function __construct(
        #[WithoutRelations] public UserWallet $userWallet
    ) {}

    public function castTo(): Collection|User|array|null
    {
        return $this->userWallet->user;
    }

    public function broadcastWith(): array
    {
        return [
            'wallet' => $this->userWallet->getAttributes(),
        ];
    }
}
