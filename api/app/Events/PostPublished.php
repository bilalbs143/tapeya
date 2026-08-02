<?php

namespace App\Events;

use App\Models\Post;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired once when a reel is first published (original uploaded / goes live to followers).
 */
class PostPublished
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Post $post,
    ) {}
}
