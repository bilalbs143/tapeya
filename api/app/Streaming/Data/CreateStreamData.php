<?php

namespace App\Streaming\Data;

use Illuminate\Support\Carbon;

final readonly class CreateStreamData
{
    public string $description;

    public function __construct(
        public string $title,
        ?string $description = null,
        public ?Carbon $scheduledAt = null,
        public string $privacy = 'public',
        public ?string $streamingUrl = null,
    ) {
        $this->description = $description ?? '';
    }
}
