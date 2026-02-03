<?php

namespace App\Events\Admin\Announcement;

use App\Events\BaseEvent;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Queue\Attributes\WithoutRelations;

class AnnouncementCreated extends BaseEvent
{
    /**
     * Create a new event instance.
     */
    public function __construct(
        #[WithoutRelations] public Announcement $announcement
    ) {}

    public function castTo(): Collection|User|array|null
    {
        return User::active()->member()->get();
    }
}
