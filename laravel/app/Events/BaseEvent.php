<?php

namespace App\Events;

use App\Models\User;
use App\Utils\Services\Utils;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

abstract class BaseEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    abstract public function castTo(): Collection|User|array|null;

    public $connection = 'redis';

    protected function getAdmins()
    {
        return Utils::getAdmins();
    }

    protected function castToAdminsAndParents(?User $user = null)
    {
        if ($user) {
            return [
                $user,
                ...$this->getAdmins(),
                // ...$user->getAllParents(),
            ];
        }

        return [
            ...$this->getAdmins(),
        ];
    }

    public function broadcastOn()
    {
        $castTo = $this->castTo();

        if (is_null($castTo)) {
            return [];
        }

        if ($castTo instanceof User) {
            return new PrivateChannel('App.Models.User.'.$castTo->id);
        }

        if (is_array($castTo) || $castTo instanceof Collection) {
            if (count($castTo) === 0) {
                return $castTo;
            }

            $broadcastTo = [];
            foreach ($castTo as $cast) {
                if ($cast instanceof User) {
                    $broadcastTo[] = new PrivateChannel("App.Models.User.{$cast->id}");
                } else {
                    $broadcastTo[] = $cast;
                }
            }

            return $broadcastTo;
        }

        return [];
    }
}
