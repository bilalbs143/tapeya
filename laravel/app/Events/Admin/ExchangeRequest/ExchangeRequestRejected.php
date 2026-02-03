<?php

namespace App\Events\Admin\ExchangeRequest;

use App\Events\BaseEvent;
use App\Models\ExchangeRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Queue\Attributes\WithoutRelations;

class ExchangeRequestRejected extends BaseEvent
{
    /**
     * Create a new event instance.
     */
    public function __construct(
        #[WithoutRelations] public ExchangeRequest $exchangeRequest
    ) {}

    public function castTo(): Collection|User|array|null
    {
        return [$this->exchangeRequest?->creator];
    }
}
