<?php

namespace App\Streaming\Data;

use Illuminate\Support\Carbon;

final readonly class CreateStreamData
{
    public function __construct(
        public string $title,
        public string $description,
        public ?Carbon $scheduledAt = null,
        public string $privacy = 'public',
    ) {}
}
