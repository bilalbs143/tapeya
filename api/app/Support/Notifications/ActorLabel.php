<?php

namespace App\Support\Notifications;

use App\Models\User;

final class ActorLabel
{
    public static function for(User $actor): string
    {
        $name = trim((string) ($actor->name ?? ''));
        if ($name !== '') {
            return $name;
        }

        $nickname = trim((string) ($actor->nickname ?? ''));
        if ($nickname !== '') {
            return $nickname;
        }

        return 'Someone';
    }
}
