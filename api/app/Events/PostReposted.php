<?php

namespace App\Events;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostReposted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Post $original,
        public Post $repost,
        public User $actor,
    ) {}
}
