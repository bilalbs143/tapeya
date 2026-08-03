<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserReferred
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public User $referrer,
        public User $referred,
    ) {}
}
