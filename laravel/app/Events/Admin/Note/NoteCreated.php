<?php

namespace App\Events\Admin\Note;

use App\Events\BaseEvent;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Queue\Attributes\WithoutRelations;

class NoteCreated extends BaseEvent
{
    /**
     * Create a new event instance.
     */
    public function __construct(
        #[WithoutRelations] public Note $note
    ) {}

    public function castTo(): Collection|User|array|null
    {
        return $this->note->users->map(fn ($noteUser) => $noteUser->user);
    }

    public function broadcastWith(): array
    {
        return [
            'record' => $this->note->getAttributes(),
        ];
    }
}
