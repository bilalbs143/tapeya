<?php

namespace App\Events\User\QuickAccountInquiry;

use App\Events\BaseEvent;
use App\Models\QuickAccountInquiry;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Queue\Attributes\WithoutRelations;

class NewQuickAccountInquiry extends BaseEvent
{
    /**
     * Create a new event instance.
     */
    public function __construct(
        #[WithoutRelations] public QuickAccountInquiry $quickAccountInquiry
    ) {}

    public function castTo(): Collection|User|array|null
    {
        return $this->castToAdminsAndParents($this->quickAccountInquiry?->creator);
    }
}
